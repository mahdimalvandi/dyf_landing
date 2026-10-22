package config

import (
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

func Load() Config {
	_ = godotenv.Load()

	jwtExpirationHours, _ := strconv.Atoi(fetchEnvironment("JWT_EXPIRATION_HOURS", "72"))
	otpExpirationMinutes, _ := strconv.Atoi(fetchEnvironment("OTP_EXPIRATION_MINUTES", "2"))

	return Config{
		AppEnv:  fetchEnvironment("APP_ENV", "development"),
		AppPort: fetchEnvironment("APP_PORT", "8080"),
		AppName: fetchEnvironment("APP_NAME", "DYF Private Catalog"),
		Database: DatabaseConfig{
			Host:     fetchEnvironment("DB_HOST", "127.0.0.1"),
			Port:     fetchEnvironment("DB_PORT", "5432"),
			User:     fetchEnvironment("DB_USER", "postgres"),
			Password: fetchEnvironment("DB_PASSWORD", "postgres"),
			DBName:   fetchEnvironment("DB_NAME", "dyf_catalog"),
			SSLMode:  fetchEnvironment("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret:          fetchEnvironment("JWT_SECRET", "dyf-default-secret-key-change-me"),
			ExpirationHours: jwtExpirationHours,
		},
		OTP: OTPConfig{
			Provider:          fetchEnvironment("OTP_PROVIDER", "mock"),
			ExpirationMinutes: otpExpirationMinutes,
		},
	}
}

func fetchEnvironment(keyName, fallbackValue string) string {
	if environmentValue := os.Getenv(keyName); environmentValue != "" {
		return environmentValue
	}
	return fallbackValue
}
