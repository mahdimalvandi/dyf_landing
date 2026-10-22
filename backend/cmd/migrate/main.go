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
	cfg := config.Load()

	db, err := database.ConnectPostgres(cfg)
	if err != nil {
		log.Fatalf("[MIGRATE CLI] Database connection error: %v", err)
	}

	migrationsDir := "migrations"
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// check if running from within cmd/migrate or backend root
		if _, err := os.Stat("../../migrations"); err == nil {
			migrationsDir = "../../migrations"
		}
	}

	migrator, err := database.NewMigrator(db, migrationsDir)
	if err != nil {
		log.Fatalf("[MIGRATE CLI] Migrator initialization error: %v", err)
	}

	flag.Parse()
	args := flag.Args()

	command := "up"
	if len(args) > 0 {
		command = args[0]
	}

	switch command {
	case "up":
		if err := migrator.Up(); err != nil {
			log.Fatalf("[MIGRATE CLI] Migration failed: %v", err)
		}
	case "down":
		if err := migrator.Down(); err != nil {
			log.Fatalf("[MIGRATE CLI] Rollback failed: %v", err)
		}
	case "status":
		if err := migrator.Status(); err != nil {
			log.Fatalf("[MIGRATE CLI] Status check failed: %v", err)
		}
	default:
		fmt.Printf("Unknown command '%s'. Available commands: up, down, status\n", command)
		os.Exit(1)
	}
}
