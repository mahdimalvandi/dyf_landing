package database

import (
	"fmt"
	"strings"
	"time"

	"dyf-backend/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

type CamelCaseNamingStrategy struct {
	schema.NamingStrategy
}

func (namingStrategy CamelCaseNamingStrategy) TableName(rawTableName string) string {
	if rawTableName == "" {
		return ""
	}
	camel := convertToLowerCamel(rawTableName)
	if !strings.HasSuffix(camel, "s") {
		return camel + "s"
	}
	return camel
}

func (namingStrategy CamelCaseNamingStrategy) ColumnName(rawTableName, rawColumnName string) string {
	if rawColumnName == "ID" {
		return "ID"
	}
	return convertToLowerCamel(rawColumnName)
}

func convertToLowerCamel(rawString string) string {
	if len(rawString) == 0 {
		return rawString
	}
	return strings.ToLower(rawString[:1]) + rawString[1:]
}

func ConnectPostgres(appConfig config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Tehran",
		appConfig.Database.Host,
		appConfig.Database.Port,
		appConfig.Database.User,
		appConfig.Database.Password,
		appConfig.Database.DBName,
		appConfig.Database.SSLMode,
	)

	gormConfiguration := &gorm.Config{
		NamingStrategy: CamelCaseNamingStrategy{},
		Logger:         logger.Default.LogMode(logger.Silent),
	}

	databaseConnection, connectionError := gorm.Open(postgres.Open(dsn), gormConfiguration)
	if connectionError != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", connectionError)
	}

	sqlDatabase, databaseError := databaseConnection.DB()
	if databaseError != nil {
		return nil, fmt.Errorf("failed to get underlying sql db: %w", databaseError)
	}

	sqlDatabase.SetMaxIdleConns(10)
	sqlDatabase.SetMaxOpenConns(50)
	sqlDatabase.SetConnMaxLifetime(time.Hour)

	return databaseConnection, nil
}
