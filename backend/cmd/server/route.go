package main

import (
	"os"

	"dyf-backend/cmd/server/routes"
	"dyf-backend/internal/handler"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/static"
	"gorm.io/gorm"
)

func SetupRoutes(fiberApp *fiber.App, databaseConnection *gorm.DB) {
	baseHandler := handler.NewBaseHandler()

	_ = os.MkdirAll("./uploads/shoes", 0755)
	fiberApp.Use("/uploads", static.New("./uploads"))

	apiGroup := fiberApp.Group("/api/v1")
	apiGroup.Get("/health", baseHandler.HealthCheck)

	routes.RegisterAuthRoutes(apiGroup, databaseConnection)
	routes.RegisterCategoryRoutes(apiGroup, databaseConnection)
	routes.RegisterShoeRoutes(apiGroup, databaseConnection)
}
