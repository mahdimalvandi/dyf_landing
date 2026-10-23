package config

import (
	"os"
	"strconv"
	"sync"

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
	CooldownSeconds   int
	MsgWayAPIKey      string
	MsgWayTemplateID  int
}

var (
	activeConfig Config
	onceLoader   sync.Once
)

func Get() Config {
	onceLoader.Do(func() {
		activeConfig = Load()
	})
	return activeConfig
}

func Load() Config {
	_ = godotenv.Load()

	tokenExpirationHours, _ := strconv.Atoi(fetchEnvironment("AUTH_TOKEN_EXPIRATION_HOURS", "72"))
	otpExpirationMinutes, _ := strconv.Atoi(fetchEnvironment("OTP_EXPIRATION_MINUTES", "2"))
	otpCooldownSeconds, _ := strconv.Atoi(fetchEnvironment("OTP_COOLDOWN_SECONDS", "120"))
	msgwayTemplateID, _ := strconv.Atoi(fetchEnvironment("MSGWAY_TEMPLATE_ID", "1"))

	loadedConfig := Config{
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
			CooldownSeconds:   otpCooldownSeconds,
			MsgWayAPIKey:      fetchEnvironment("MSGWAY_API_KEY", "006587c3c4c9daedb39f97bd9dec59e4"),
			MsgWayTemplateID:  msgwayTemplateID,
		},
	}

	activeConfig = loadedConfig
	return loadedConfig
}

func fetchEnvironment(keyName, fallbackValue string) string {
	if environmentValue := os.Getenv(keyName); environmentValue != "" {
		return environmentValue
	}
	return fallbackValue
}
