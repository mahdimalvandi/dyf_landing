package link

import (
	"dyf-backend/config"
	repoAuth "dyf-backend/internal/repository/auth"
	repoCategory "dyf-backend/internal/repository/category"
	repoCustomer "dyf-backend/internal/repository/customer"
	repoLink "dyf-backend/internal/repository/link"
	repoShoe "dyf-backend/internal/repository/shoe"
	"dyf-backend/pkg/sms"
)

type Service struct {
	linkRepository       repoLink.Repository
	shoeRepository       repoShoe.Repository
	customerRepository   repoCustomer.Repository
	authRepository       repoAuth.Repository
	categoryRepository   repoCategory.Repository
	smsSender            sms.Sender
	expirationSec        int
	cooldownSec          int
	msgWayTemplate       int
	tokenExpirationHours int
}

func NewService(
	linkRepository repoLink.Repository,
	shoeRepository repoShoe.Repository,
	customerRepository repoCustomer.Repository,
	authRepository repoAuth.Repository,
	categoryRepository repoCategory.Repository,
) Service {
	appConfig := config.Get()
	return Service{
		linkRepository:       linkRepository,
		shoeRepository:       shoeRepository,
		customerRepository:   customerRepository,
		authRepository:       authRepository,
		categoryRepository:   categoryRepository,
		smsSender:            sms.NewSender(),
		expirationSec:        appConfig.OTP.ExpirationMinutes * 60,
		cooldownSec:          appConfig.OTP.CooldownSeconds,
		msgWayTemplate:       appConfig.OTP.MsgWayTemplateID,
		tokenExpirationHours: appConfig.Auth.TokenExpirationHours,
	}
}
