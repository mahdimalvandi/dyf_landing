package routes

import (
	handlerInquiry "dyf-backend/internal/handler/inquiry"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoInquiry "dyf-backend/internal/repository/inquiry"
	serviceInquiry "dyf-backend/internal/service/inquiry"
	"dyf-backend/pkg/response"
	staticErrors "dyf-backend/statics/errors"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"gorm.io/gorm"
	"time"
)

func RegisterInquiryRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	inquiryHandler := handlerInquiry.NewHandler(serviceInquiry.NewService(repoInquiry.NewRepository(databaseConnection)))
	apiGroup.Post("/inquiries", inquiryHandler.Create, limiter.New(limiter.Config{
		Max: 5, Expiration: time.Minute,
		LimitReached: func(fiberContext fiber.Ctx) error {
			return response.FromError(fiberContext, fiber.StatusTooManyRequests, staticErrors.ErrTooManyRequests, nil)
		},
	}))
	apiGroup.Get("/inquiries", inquiryHandler.List, middleware.RequireAdminAuth(repoAuth.NewRepository(databaseConnection)))
}
