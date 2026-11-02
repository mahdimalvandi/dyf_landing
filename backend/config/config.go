package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv          string
	AppPort         string
	AppName         string
	Database        DatabaseConfig
	Auth            AuthConfig
	OTP             OTPConfig
	MediaSigningKey string
	AllowedOrigins  []string
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

	tokenExpirationHours, _ := strconv.Atoi(fetchEnvironment("AUTH_TOKEN_EXPIRATION_HOURS", "720"))
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
			MsgWayAPIKey:      fetchEnvironment("MSGWAY_API_KEY", ""),
			MsgWayTemplateID:  msgwayTemplateID,
		},
		MediaSigningKey: fetchEnvironment("MEDIA_SIGNING_KEY", ""),
		AllowedOrigins:  strings.Split(fetchEnvironment("CORS_ALLOWED_ORIGINS", "https://dyfshoes.ir"), ","),
	}

	activeConfig = loadedConfig
	return loadedConfig
}

// Validate runs before database initialization so unsafe deployments fail closed.
func (c Config) Validate() error {
	if c.AppEnv != "development" && c.AppEnv != "test" && c.AppEnv != "production" {
		return fmt.Errorf("APP_ENV must be development, test or production")
	}
	if c.Auth.TokenExpirationHours <= 0 || c.OTP.ExpirationMinutes <= 0 || c.OTP.CooldownSeconds <= 0 {
		return fmt.Errorf("authentication expiry and cooldown values must be positive")
	}
	if c.OTP.Provider != "mock" && c.OTP.Provider != "msgway" {
		return fmt.Errorf("unsupported OTP_PROVIDER")
	}
	if c.OTP.Provider == "msgway" && (c.OTP.MsgWayAPIKey == "" || c.OTP.MsgWayTemplateID <= 0) {
		return fmt.Errorf("MsgWay credentials and template are required")
	}
	if c.AppEnv == "production" {
		if len(c.AllowedOrigins) == 0 {
			return fmt.Errorf("production CORS origins are required")
		}
		if c.OTP.Provider == "mock" {
			return fmt.Errorf("mock OTP is forbidden in production")
		}
		if len(c.MediaSigningKey) < 32 {
			return fmt.Errorf("MEDIA_SIGNING_KEY must contain at least 32 bytes in production")
		}
		for _, origin := range c.AllowedOrigins {
			if !strings.HasPrefix(strings.TrimSpace(origin), "https://") || strings.Contains(origin, "*") {
				return fmt.Errorf("production CORS origins must be explicit HTTPS origins")
			}
		}
	}
	return nil
}

func fetchEnvironment(keyName, fallbackValue string) string {
	if environmentValue := os.Getenv(keyName); environmentValue != "" {
		return environmentValue
	}
	return fallbackValue
}
