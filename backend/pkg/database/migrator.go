package database

import (
	"database/sql"
	"errors"
	"fmt"

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
		return Migrator{}, fmt.Errorf("failed creating postgres driver instance: %w", driverError)
	}

	sourceURL := fmt.Sprintf("file://%s", migrationsDirectory)
	migrateInstance, migrateError := migrate.NewWithDatabaseInstance(sourceURL, "postgres", driverInstance)
	if migrateError != nil {
		return Migrator{}, fmt.Errorf("failed initializing golang-migrate: %w", migrateError)
	}

	return Migrator{
		migrateInstance: migrateInstance,
	}, nil
}

func (migrator Migrator) Up() error {
	migrationError := migrator.migrateInstance.Up()
	if migrationError != nil && !errors.Is(migrationError, migrate.ErrNoChange) {
		return migrationError
	}
	return nil
}

func (migrator Migrator) Down() error {
	migrationError := migrator.migrateInstance.Steps(-1)
	if migrationError != nil && !errors.Is(migrationError, migrate.ErrNoChange) {
		return migrationError
	}
	return nil
}

func (migrator Migrator) Version() (uint, bool, error) {
	version, isDirty, versionError := migrator.migrateInstance.Version()
	if versionError != nil && !errors.Is(versionError, migrate.ErrNilVersion) {
		return 0, false, versionError
	}
	return version, isDirty, nil
}
