package routes

import (
	handlerInquiry "dyf-backend/internal/handler/inquiry"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoInquiry "dyf-backend/internal/repository/inquiry"
	serviceInquiry "dyf-backend/internal/service/inquiry"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterInquiryRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	inquiryHandler := handlerInquiry.NewHandler(serviceInquiry.NewService(repoInquiry.NewRepository(databaseConnection)))
	apiGroup.Post("/inquiries", inquiryHandler.Create, middleware.RateLimit(5))
	apiGroup.Get("/inquiries", inquiryHandler.List, middleware.RequireAdminAuth(repoAuth.NewRepository(databaseConnection)))
}
