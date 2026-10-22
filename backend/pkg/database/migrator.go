package database

import (
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

type Migrator struct {
	migrateInstance *migrate.Migrate
}

func NewMigrator(sqlDatabase *sql.DB, migrationsDirectory string) (Migrator, error) {
	driverInstance, driverError := postgres.WithInstance(sqlDatabase, &postgres.Config{
		MigrationsTable: "schemaMigrations",
	})
	if driverError != nil {
		log.Printf("[MIGRATE ERROR] failed creating postgres driver instance: %v", driverError)
		return Migrator{}, fmt.Errorf("failed creating postgres driver instance: %w", driverError)
	}

	sourceURL := fmt.Sprintf("file://%s", migrationsDirectory)
	migrateInstance, migrateError := migrate.NewWithDatabaseInstance(sourceURL, "postgres", driverInstance)
	if migrateError != nil {
		log.Printf("[MIGRATE ERROR] failed initializing golang-migrate: %v", migrateError)
		return Migrator{}, fmt.Errorf("failed initializing golang-migrate: %w", migrateError)
	}

	return Migrator{
		migrateInstance: migrateInstance,
	}, nil
}

func (migrator Migrator) Up() error {
	migrationError := migrator.migrateInstance.Up()
	if migrationError != nil {
		if errors.Is(migrationError, migrate.ErrNoChange) {
			log.Println("[MIGRATE SUCCESS] database is up to date (no new migrations to apply)")
			return nil
		}
		log.Printf("[MIGRATE ERROR] failed applying migrations up: %v", migrationError)
		return migrationError
	}
	log.Println("[MIGRATE SUCCESS] all migrations applied successfully")
	return nil
}

func (migrator Migrator) Down() error {
	migrationError := migrator.migrateInstance.Steps(-1)
	if migrationError != nil {
		if errors.Is(migrationError, migrate.ErrNoChange) {
			log.Println("[MIGRATE SUCCESS] no migrations to rollback")
			return nil
		}
		log.Printf("[MIGRATE ERROR] failed applying migration down (rollback): %v", migrationError)
		return migrationError
	}
	log.Println("[MIGRATE SUCCESS] rolled back last migration successfully")
	return nil
}

func (migrator Migrator) Version() (uint, bool, error) {
	version, isDirty, versionError := migrator.migrateInstance.Version()
	if versionError != nil {
		if errors.Is(versionError, migrate.ErrNilVersion) {
			log.Println("[MIGRATE SUCCESS] no migrations applied yet (version 0)")
			return 0, false, nil
		}
		log.Printf("[MIGRATE ERROR] failed fetching current migration version: %v", versionError)
		return 0, false, versionError
	}
	log.Printf("[MIGRATE SUCCESS] current migration version: %d (dirty: %t)", version, isDirty)
	return version, isDirty, nil
}
