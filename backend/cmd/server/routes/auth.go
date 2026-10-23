package routes

import (
	handlerauth "dyf-backend/internal/handler/auth"
	"dyf-backend/internal/middleware"
	repoauth "dyf-backend/internal/repository/auth"
	serviceauth "dyf-backend/internal/service/auth"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterAuthRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	authRepository := repoauth.NewRepository(databaseConnection)
	authService := serviceauth.NewService(authRepository)
	authHandler := handlerauth.NewHandler(authService)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	adminAuthGroup := apiGroup.Group("/auth/admin")
	adminAuthGroup.Post("/otp/send", authHandler.SendOTP)
	adminAuthGroup.Post("/otp/verify", authHandler.VerifyOTP)
	adminAuthGroup.Post("/logout", adminAuthMiddleware, authHandler.Logout)
	adminAuthGroup.Get("/me", adminAuthMiddleware, authHandler.Me)
}
