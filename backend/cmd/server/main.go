package main

import (
	"fmt"
	"log"

	"dyf-backend/config"
	"dyf-backend/internal/handler"
	"dyf-backend/internal/middleware"
	"dyf-backend/pkg/database"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// 1. Load Application Configuration
	cfg := config.Load()

	// 2. Initialize PostgreSQL connection with camelCase naming strategy
	db, err := database.ConnectPostgres(cfg)
	if err != nil {
		log.Printf("[SERVER] Warning: Database connection failed: %v. Running in offline/degraded mode.", err)
	} else {
		_ = db
	}

	// 3. Initialize Fiber application with unified error handling
	app := fiber.New(fiber.Config{
		AppName:      cfg.AppName,
		ErrorHandler: middleware.GlobalErrorHandler,
	})

	// 4. Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowMethods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	// 5. Base Router & Health Check
	baseHandler := handler.NewBaseHandler()
	api := app.Group("/api/v1")
	api.Get("/health", baseHandler.HealthCheck)

	// 6. Start HTTP Server
	addr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("[SERVER] %s is starting on http://localhost%s", cfg.AppName, addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("[SERVER] Failed to start server: %v", err)
	}
}
