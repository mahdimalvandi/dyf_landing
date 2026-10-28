package service

import (
	"context"
	"log"
	"time"

	"dyf-backend/config"
	"dyf-backend/internal/middleware"
	"dyf-backend/pkg/database"
	"dyf-backend/pkg/media"

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
	if err := appConfig.Validate(); err != nil {
		log.Fatalf("[CONFIG ERROR] %v", err)
	}
	if err := media.Configure(appConfig.MediaSigningKey); err != nil {
		log.Fatalf("[MEDIA CONFIG ERROR] %v", err)
	}
	databaseConnection, connectionError := database.ConnectPostgres(appConfig)
	if connectionError != nil {
		log.Fatalf("[DATABASE ERROR] failed to connect: %v", connectionError)
	}

	fastJSON := jsonIter.ConfigCompatibleWithStandardLibrary

	fiberApplication := fiber.New(fiber.Config{
		AppName:      appConfig.AppName,
		ErrorHandler: middleware.GlobalErrorHandler,
		JSONEncoder:  fastJSON.Marshal,
		JSONDecoder:  fastJSON.Unmarshal,
	})

	fiberApplication.Use(recover.New())
	// Never log query strings: catalog credentials and signed media URLs contain secrets.
	fiberApplication.Use(logger.New(logger.Config{Format: "${time} ${status} ${method}\n"}))
	fiberApplication.Use(func(c fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("Referrer-Policy", "no-referrer")
		c.Set("X-Robots-Tag", "noindex, nofollow, noarchive")
		c.Set("Cache-Control", "private, no-store")
		return c.Next()
	})
	fiberApplication.Use(cors.New(cors.Config{
		AllowOrigins: appConfig.AllowedOrigins,
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
