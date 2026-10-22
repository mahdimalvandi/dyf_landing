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
	Auth     AuthConfig
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

type AuthConfig struct {
	TokenExpirationHours int
}

type OTPConfig struct {
	Provider          string
	ExpirationMinutes int
}

func Load() Config {
	_ = godotenv.Load()

	tokenExpirationHours, _ := strconv.Atoi(fetchEnvironment("AUTH_TOKEN_EXPIRATION_HOURS", "72"))
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
		Auth: AuthConfig{
			TokenExpirationHours: tokenExpirationHours,
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
