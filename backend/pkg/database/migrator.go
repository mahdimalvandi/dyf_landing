package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type MigrationRecord struct {
	ID        int
	Version   int
	Name      string
	AppliedAt time.Time
}

type Migrator struct {
	db            *gorm.DB
	sqlDB         *sql.DB
	migrationsDir string
}

func NewMigrator(db *gorm.DB, migrationsDir string) (*Migrator, error) {
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	m := &Migrator{
		db:            db,
		sqlDB:         sqlDB,
		migrationsDir: migrationsDir,
	}
	if err := m.ensureMigrationsTable(); err != nil {
		return nil, err
	}
	return m, nil
}

func (m *Migrator) ensureMigrationsTable() error {
	query := `
		CREATE TABLE IF NOT EXISTS "schemaMigrations" (
			"id" SERIAL PRIMARY KEY,
			"version" INT NOT NULL UNIQUE,
			"name" VARCHAR(255) NOT NULL,
			"appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`
	_, err := m.sqlDB.Exec(query)
	return err
}

type migrationFile struct {
	version   int
	name      string
	filePath  string
	direction string // "up" or "down"
}

func (m *Migrator) getAppliedVersions() (map[int]bool, error) {
	rows, err := m.sqlDB.Query(`SELECT "version" FROM "schemaMigrations" ORDER BY "version" ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[int]bool)
	for rows.Next() {
		var v int
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		applied[v] = true
	}
	return applied, nil
}

func (m *Migrator) scanFiles(direction string) ([]migrationFile, error) {
	files, err := os.ReadDir(m.migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("could not read migrations directory: %w", err)
	}

	var result []migrationFile
	suffix := "." + direction + ".sql"

	for _, f := range files {
		if f.IsDir() || !strings.HasSuffix(f.Name(), suffix) {
			continue
		}

		parts := strings.SplitN(f.Name(), "_", 2)
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			continue
		}

		name := strings.TrimSuffix(parts[1], suffix)
		result = append(result, migrationFile{
			version:   version,
			name:      name,
			filePath:  filepath.Join(m.migrationsDir, f.Name()),
			direction: direction,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].version < result[j].version
	})

	return result, nil
}

// Up runs all unapplied migrations
func (m *Migrator) Up() error {
	applied, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to fetch applied migrations: %w", err)
	}

	upFiles, err := m.scanFiles("up")
	if err != nil {
		return err
	}

	appliedCount := 0
	for _, file := range upFiles {
		if applied[file.version] {
			continue
		}

		log.Printf("[MIGRATE] Applying %06d_%s.up.sql...", file.version, file.name)
		content, err := os.ReadFile(file.filePath)
		if err != nil {
			return fmt.Errorf("error reading %s: %w", file.filePath, err)
		}

		tx, err := m.sqlDB.Begin()
		if err != nil {
			return fmt.Errorf("failed to start transaction: %w", err)
		}

		if _, err := tx.Exec(string(content)); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed executing %s: %w", file.filePath, err)
		}

		insertQuery := `INSERT INTO "schemaMigrations" ("version", "name") VALUES ($1, $2)`
		if _, err := tx.Exec(insertQuery, file.version, file.name); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed recording migration %d: %w", file.version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit transaction: %w", err)
		}

		log.Printf("[MIGRATE] Successfully applied %06d_%s.up.sql", file.version, file.name)
		appliedCount++
	}

	if appliedCount == 0 {
		log.Println("[MIGRATE] Database is up to date. No new migrations.")
	} else {
		log.Printf("[MIGRATE] Total %d migration(s) applied successfully.", appliedCount)
	}
	return nil
}

// Down rolls back the most recent migration
func (m *Migrator) Down() error {
	var lastVersion int
	var lastName string
	err := m.sqlDB.QueryRow(`SELECT "version", "name" FROM "schemaMigrations" ORDER BY "version" DESC LIMIT 1`).Scan(&lastVersion, &lastName)
	if err == sql.ErrNoRows {
		log.Println("[MIGRATE] No migrations to roll back.")
		return nil
	}
	if err != nil {
		return fmt.Errorf("failed checking last migration: %w", err)
	}

	downFileName := fmt.Sprintf("%06d_%s.down.sql", lastVersion, lastName)
	downFilePath := filepath.Join(m.migrationsDir, downFileName)

	content, err := os.ReadFile(downFilePath)
	if err != nil {
		return fmt.Errorf("down file not found (%s): %w", downFilePath, err)
	}

	log.Printf("[MIGRATE] Rolling back %s...", downFileName)
	tx, err := m.sqlDB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	if _, err := tx.Exec(string(content)); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("failed executing %s: %w", downFileName, err)
	}

	if _, err := tx.Exec(`DELETE FROM "schemaMigrations" WHERE "version" = $1`, lastVersion); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("failed removing migration record: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback: %w", err)
	}

	log.Printf("[MIGRATE] Rolled back %s successfully.", downFileName)
	return nil
}

// Status prints current migration status
func (m *Migrator) Status() error {
	applied, err := m.getAppliedVersions()
	if err != nil {
		return err
	}

	upFiles, err := m.scanFiles("up")
	if err != nil {
		return err
	}

	fmt.Println("-----------------------------------------------------------------")
	fmt.Printf("%-10s %-35s %-15s\n", "VERSION", "MIGRATION NAME", "STATUS")
	fmt.Println("-----------------------------------------------------------------")
	for _, f := range upFiles {
		status := "Pending"
		if applied[f.version] {
			status = "Applied"
		}
		fmt.Printf("%06d     %-35s %-15s\n", f.version, f.name, status)
	}
	fmt.Println("-----------------------------------------------------------------")
	return nil
}
