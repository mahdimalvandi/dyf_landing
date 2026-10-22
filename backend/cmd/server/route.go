package main

import (
	"dyf-backend/internal/handler"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func SetupRoutes(fiberApp *fiber.App, databaseConnection *gorm.DB) {
	baseHandler := handler.NewBaseHandler()

	apiGroup := fiberApp.Group("/api/v1")
	apiGroup.Get("/health", baseHandler.HealthCheck)

	SetupCustomerRoute(apiGroup, databaseConnection)
	SetupShoeRoute(apiGroup, databaseConnection)
	SetupCategoryRoute(apiGroup, databaseConnection)
	SetupAccessLinkRoute(apiGroup, databaseConnection)
	SetupAuthRoute(apiGroup, databaseConnection)
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

func SetupAuthRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}

func SetupCatalogRoute(apiGroup fiber.Router, databaseConnection *gorm.DB) {
}
