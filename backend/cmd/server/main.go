package main

import (
	"fmt"
	"log"

	"dyf-backend/config"
	"dyf-backend/internal/handler"
	"dyf-backend/internal/middleware"
	"dyf-backend/pkg/database"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	jsoniter "github.com/json-iterator/go"
)

func main() {
	appConfig := config.Load()

	databaseConnection, connectionError := database.ConnectPostgres(appConfig)
	if connectionError != nil {
		log.Printf("database connection failed: %v", connectionError)
	} else {
		_ = databaseConnection
	}

	fastJSON := jsoniter.ConfigCompatibleWithStandardLibrary

	fiberApplication := fiber.New(fiber.Config{
		AppName:      appConfig.AppName,
		ErrorHandler: middleware.GlobalErrorHandler,
		JSONEncoder:  fastJSON.Marshal,
		JSONDecoder:  fastJSON.Unmarshal,
	})

	fiberApplication.Use(recover.New())
	fiberApplication.Use(logger.New())
	fiberApplication.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
	}))

	baseHandler := handler.NewBaseHandler()
	apiGroup := fiberApplication.Group("/api/v1")
	apiGroup.Get("/health", baseHandler.HealthCheck)

	serverAddress := fmt.Sprintf(":%s", appConfig.AppPort)
	log.Printf("%s listening on %s", appConfig.AppName, serverAddress)
	if listenError := fiberApplication.Listen(serverAddress); listenError != nil {
		log.Fatalf("server failed: %v", listenError)
	}
}
