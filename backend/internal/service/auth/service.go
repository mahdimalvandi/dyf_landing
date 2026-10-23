package auth

import (
	"dyf-backend/config"
	repoAuth "dyf-backend/internal/repository/auth"
	"dyf-backend/pkg/sms"
)

type Service struct {
	repository           repoAuth.Repository
	smsSender            sms.Sender
	expirationSec        int
	cooldownSec          int
	msgWayTemplate       int
	tokenExpirationHours int
}

func NewService(repository repoAuth.Repository) Service {
	appConfig := config.Get()
	return Service{
		repository:           repository,
		smsSender:            sms.NewSender(),
		expirationSec:        appConfig.OTP.ExpirationMinutes * 60,
		cooldownSec:          appConfig.OTP.CooldownSeconds,
		msgWayTemplate:       appConfig.OTP.MsgWayTemplateID,
		tokenExpirationHours: appConfig.Auth.TokenExpirationHours,
	}
}
