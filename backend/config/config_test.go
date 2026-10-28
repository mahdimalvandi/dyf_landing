package config

import "testing"

func TestProductionValidation(t *testing.T) {
	valid := Config{AppEnv: "production", Auth: AuthConfig{TokenExpirationHours: 1},
		OTP:             OTPConfig{Provider: "msgway", ExpirationMinutes: 2, CooldownSeconds: 120, MsgWayAPIKey: "test", MsgWayTemplateID: 1},
		MediaSigningKey: "test-secret-at-least-thirty-two-bytes", AllowedOrigins: []string{"https://dyfshoes.ir"}}
	if err := valid.Validate(); err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		name   string
		change func(*Config)
	}{
		{"mock OTP", func(c *Config) { c.OTP.Provider = "mock" }},
		{"missing SMS key", func(c *Config) { c.OTP.MsgWayAPIKey = "" }},
		{"missing media key", func(c *Config) { c.MediaSigningKey = "" }},
		{"wildcard origin", func(c *Config) { c.AllowedOrigins = []string{"*"} }},
		{"invalid environment", func(c *Config) { c.AppEnv = "prodution" }},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			c := valid
			item.change(&c)
			if c.Validate() == nil {
				t.Fatal("unsafe configuration accepted")
			}
		})
	}
}
