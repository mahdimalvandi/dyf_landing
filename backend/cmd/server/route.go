package main

import (
	"dyf-backend/config"
	"dyf-backend/internal/handler"
	handlerauth "dyf-backend/internal/handler/auth"
	repoauth "dyf-backend/internal/repository/auth"
	serviceauth "dyf-backend/internal/service/auth"
	"dyf-backend/pkg/sms"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func SetupRoutes(fiberApp *fiber.App, databaseConnection *gorm.DB, appConfig config.Config) {
	baseHandler := handler.NewBaseHandler()

	apiGroup := fiberApp.Group("/api/v1")
	apiGroup.Get("/health", baseHandler.HealthCheck)

	SetupCustomerRoute(apiGroup, databaseConnection)
	SetupShoeRoute(apiGroup, databaseConnection)
	SetupCategoryRoute(apiGroup, databaseConnection)
	SetupAccessLinkRoute(apiGroup, databaseConnection)
	SetupAuthRoute(apiGroup, databaseConnection, appConfig)
	SetupCatalogRoute(apiGroup, databaseConnection)
}

func SetupCustomerRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}

func SetupShoeRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}

func SetupCategoryRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}

func SetupAccessLinkRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}

func SetupAuthRoute(apiGroup fiber.Router, databaseConnection *gorm.DB, appConfig config.Config) {
	authRepository := repoauth.NewRepository(databaseConnection)
	smsSender := sms.NewSender(appConfig)

	expirationSeconds := appConfig.OTP.ExpirationMinutes * 60
	cooldownSeconds := appConfig.OTP.CooldownSeconds

	sendOTPService := serviceauth.NewSendOTPService(
		authRepository,
		smsSender,
		expirationSeconds,
		cooldownSeconds,
		appConfig.OTP.MsgWayTemplateID,
	)
	verifyOTPService := serviceauth.NewVerifyOTPService(authRepository)
	logoutService := serviceauth.NewLogoutService()

	sendOTPHandler := handlerauth.NewSendOTPHandler(sendOTPService)
	verifyOTPHandler := handlerauth.NewVerifyOTPHandler(verifyOTPService)
	logoutHandler := handlerauth.NewLogoutHandler(logoutService)

	adminAuthGroup := apiGroup.Group("/auth/admin")
	adminAuthGroup.Post("/otp/send", sendOTPHandler.Handle)
	adminAuthGroup.Post("/otp/verify", verifyOTPHandler.Handle)
	adminAuthGroup.Post("/logout", logoutHandler.Handle)
}

func SetupCatalogRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}
