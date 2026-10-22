package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"dyf-backend/config"
	"dyf-backend/pkg/database"
)

func main() {
	appConfig := config.Load()

	databaseConnection, connectionError := database.ConnectPostgres(appConfig)
	if connectionError != nil {
		log.Fatalf("database connection error: %v", connectionError)
	}

	sqlDatabase, sqlDatabaseError := databaseConnection.DB()
	if sqlDatabaseError != nil {
		log.Fatalf("sql db error: %v", sqlDatabaseError)
	}

	migrationsDirectory := "migrations"
	if _, statError := os.Stat(migrationsDirectory); os.IsNotExist(statError) {
		if _, fallbackStatError := os.Stat("../../migrations"); fallbackStatError == nil {
			migrationsDirectory = "../../migrations"
		}
	}

	migratorInstance, migratorError := database.NewMigrator(sqlDatabase, migrationsDirectory)
	if migratorError != nil {
		log.Fatalf("migrator initialization error: %v", migratorError)
	}

	flag.Parse()
	commandArguments := flag.Args()

	commandName := "up"
	if len(commandArguments) > 0 {
		commandName = commandArguments[0]
	}

	switch commandName {
	case "up":
		if runError := migratorInstance.Up(); runError != nil {
			log.Fatalf("migration failed: %v", runError)
		}
		fmt.Println("migrations applied successfully")
	case "down":
		if runError := migratorInstance.Down(); runError != nil {
			log.Fatalf("rollback failed: %v", runError)
		}
		fmt.Println("rollback applied successfully")
	case "version":
		currentVersion, isDirty, versionError := migratorInstance.Version()
		if versionError != nil {
			log.Fatalf("version check failed: %v", versionError)
		}
		fmt.Printf("current version: %d (dirty: %t)\n", currentVersion, isDirty)
	default:
		fmt.Printf("unknown command '%s'. Available: up, down, version\n", commandName)
		os.Exit(1)
	}
}
