package main

import (
	"dyf-backend/cmd/server/routes"
	"dyf-backend/internal/handler"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func SetupRoutes(fiberApp *fiber.App, databaseConnection *gorm.DB) {
	baseHandler := handler.NewBaseHandler()

	apiGroup := fiberApp.Group("/api/v1")
	apiGroup.Get("/health", baseHandler.HealthCheck)

	routes.RegisterAuthRoutes(apiGroup, databaseConnection)
}
