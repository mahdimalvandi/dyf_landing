package auth

import (
	"dyf-backend/config"
	repoauth "dyf-backend/internal/repository/auth"
	"dyf-backend/pkg/sms"
)

type Service struct {
	repository           repoauth.Repository
	smsSender            sms.Sender
	expirationSec        int
	cooldownSec          int
	msgwayTemplate       int
	tokenExpirationHours int
}

func NewService(repository repoauth.Repository) Service {
	appConfig := config.Get()
	return Service{
		repository:           repository,
		smsSender:            sms.NewSender(),
		expirationSec:        appConfig.OTP.ExpirationMinutes * 60,
		cooldownSec:          appConfig.OTP.CooldownSeconds,
		msgwayTemplate:       appConfig.OTP.MsgWayTemplateID,
		tokenExpirationHours: appConfig.Auth.TokenExpirationHours,
	}
}
