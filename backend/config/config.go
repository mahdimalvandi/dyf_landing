package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv   string
	AppPort  string
	AppName  string
	Database DatabaseConfig
	JWT      JWTConfig
	OTP      OTPConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	Secret          string
	ExpirationHours int
}

type OTPConfig struct {
	Provider          string
	ExpirationMinutes int
}

// Load loads configuration from environment variables or .env file
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("[CONFIG] Notice: .env file not found, reading from system environment")
	}

	jwtExpHours, _ := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "72"))
	otpExpMinutes, _ := strconv.Atoi(getEnv("OTP_EXPIRATION_MINUTES", "2"))

	return &Config{
		AppEnv:  getEnv("APP_ENV", "development"),
		AppPort: getEnv("APP_PORT", "8080"),
		AppName: getEnv("APP_NAME", "DYF Private Catalog"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "dyf_catalog"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "dyf-default-secret-key-change-me"),
			ExpirationHours: jwtExpHours,
		},
		OTP: OTPConfig{
			Provider:          getEnv("OTP_PROVIDER", "mock"),
			ExpirationMinutes: otpExpMinutes,
		},
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
