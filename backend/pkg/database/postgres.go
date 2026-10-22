package database

import (
	"fmt"
	"log"
	"strings"
	"time"

	"dyf-backend/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

// CamelCaseNamingStrategy implements GORM's schema.Namer interface
// to enforce camelCase table and column names in PostgreSQL.
type CamelCaseNamingStrategy struct {
	schema.NamingStrategy
}

func (ns CamelCaseNamingStrategy) TableName(str string) string {
	if str == "" {
		return ""
	}
	// e.g. ShoeModel -> shoeModels
	lower := toLowerCamel(str)
	if !strings.HasSuffix(lower, "s") {
		return lower + "s"
	}
	return lower
}

func (ns CamelCaseNamingStrategy) ColumnName(table, column string) string {
	return toLowerCamel(column)
}

func toLowerCamel(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}

// ConnectPostgres establishes a GORM connection using camelCase naming strategy
func ConnectPostgres(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Tehran",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	gormConfig := &gorm.Config{
		NamingStrategy: CamelCaseNamingStrategy{},
		Logger:         logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB from gorm: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("[DATABASE] PostgreSQL connection established successfully with camelCase naming strategy")
	return db, nil
}
