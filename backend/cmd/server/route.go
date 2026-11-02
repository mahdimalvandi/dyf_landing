package main

import (
	"os"

	"dyf-backend/cmd/server/routes"
	"dyf-backend/internal/handler"
	constantsShoe "dyf-backend/statics/constants/shoe"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func SetupRoutes(fiberApp *fiber.App, databaseConnection *gorm.DB) {
	baseHandler := handler.NewBaseHandler()

	_ = os.MkdirAll(constantsShoe.UploadDirectory, 0755)
	routes.RegisterMediaRoutes(fiberApp, databaseConnection)

	apiGroup := fiberApp.Group("/api/v1")
	apiGroup.Get("/health", baseHandler.HealthCheck)

	routes.RegisterAuthRoutes(apiGroup, databaseConnection)
	routes.RegisterCategoryRoutes(apiGroup, databaseConnection)
	routes.RegisterShoeRoutes(apiGroup, databaseConnection)
	routes.RegisterCustomerRoutes(apiGroup, databaseConnection)
	routes.RegisterLinkRoutes(apiGroup, databaseConnection)
	routes.RegisterDashboardRoutes(apiGroup, databaseConnection)
	routes.RegisterInquiryRoutes(apiGroup, databaseConnection)
}
