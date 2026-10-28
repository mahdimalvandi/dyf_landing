package routes

import (
	handlerAuth "dyf-backend/internal/handler/auth"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	serviceAuth "dyf-backend/internal/service/auth"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterAuthRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	authRepository := repoAuth.NewRepository(databaseConnection)
	authService := serviceAuth.NewService(authRepository)
	authHandler := handlerAuth.NewHandler(authService)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	adminAuthGroup := apiGroup.Group("/auth/admin")
	customerAuthGroup := apiGroup.Group("/auth/customer")
	// Fiber v3 takes the endpoint handler first, then middleware (executed before it).
	customerAuthGroup.Post("/otp/send", authHandler.SendCustomerOTP, middleware.RateLimit(5))
	customerAuthGroup.Post("/otp/verify", authHandler.VerifyCustomerOTP, middleware.RateLimit(10))
	adminAuthGroup.Post("/otp/send", authHandler.SendOTP, middleware.RateLimit(5))
	adminAuthGroup.Post("/otp/verify", authHandler.VerifyOTP, middleware.RateLimit(10))

	protectedAdminGroup := adminAuthGroup.Group("", adminAuthMiddleware)
	protectedAdminGroup.Post("/logout", authHandler.Logout)
	protectedAdminGroup.Get("/me", authHandler.Me)
}
