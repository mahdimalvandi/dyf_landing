package routes

import (
	handlerAuth "dyf-backend/internal/handler/auth"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	serviceAuth "dyf-backend/internal/service/auth"
	"dyf-backend/pkg/response"
	staticErrors "dyf-backend/statics/errors"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"time"

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
	customerAuthGroup.Post("/otp/send", authHandler.SendCustomerOTP, limiter.New(limiter.Config{Max: 5, Expiration: time.Minute,
		LimitReached: func(context fiber.Ctx) error {
			return response.FromError(context, fiber.StatusTooManyRequests, staticErrors.ErrTooManyRequests, nil)
		},
	}))
	customerAuthGroup.Post("/otp/verify", authHandler.VerifyCustomerOTP, limiter.New(limiter.Config{Max: 10, Expiration: time.Minute,
		LimitReached: func(context fiber.Ctx) error {
			return response.FromError(context, fiber.StatusTooManyRequests, staticErrors.ErrTooManyRequests, nil)
		},
	}))
	adminAuthGroup.Post("/otp/send", authHandler.SendOTP)
	adminAuthGroup.Post("/otp/verify", authHandler.VerifyOTP, limiter.New(limiter.Config{
		Max: 10, Expiration: time.Minute,
		LimitReached: func(fiberContext fiber.Ctx) error {
			return response.FromError(fiberContext, fiber.StatusTooManyRequests, staticErrors.ErrTooManyRequests, nil)
		},
	}))

	protectedAdminGroup := adminAuthGroup.Group("", adminAuthMiddleware)
	protectedAdminGroup.Post("/logout", authHandler.Logout)
	protectedAdminGroup.Get("/me", authHandler.Me)
}
