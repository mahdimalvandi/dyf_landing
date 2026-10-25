package service

import (
	"context"
	"log"
	"time"

	"dyf-backend/config"
	"dyf-backend/internal/middleware"
	"dyf-backend/pkg/database"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	jsonIter "github.com/json-iterator/go"
	"gorm.io/gorm"
)

type CoreService struct {
	FiberApp           *fiber.App
	DatabaseConnection *gorm.DB
	Config             config.Config
}

func New(appConfig config.Config) CoreService {
	databaseConnection, connectionError := database.ConnectPostgres(appConfig)
	if connectionError != nil {
		log.Printf("[DATABASE ERROR] failed to connect: %v", connectionError)
	}

	fastJSON := jsonIter.ConfigCompatibleWithStandardLibrary

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

	fiberApplication.Use(func(fiberContext fiber.Ctx) error {
		timeoutContext, cancelTimeout := context.WithTimeout(fiberContext.UserContext(), 10*time.Second)
		defer cancelTimeout()
		fiberContext.SetUserContext(timeoutContext)
		return fiberContext.Next()
	})

	return CoreService{
		FiberApp:           fiberApplication,
		DatabaseConnection: databaseConnection,
		Config:             appConfig,
	}
}
