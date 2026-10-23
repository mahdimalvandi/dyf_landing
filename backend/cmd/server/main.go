package main

import (
	"fmt"
	"log"

	"dyf-backend/config"
	"dyf-backend/pkg/service"
)

func main() {
	appConfig := config.Load()

	coreService := service.New(appConfig)

	SetupRoutes(coreService.FiberApp, coreService.DatabaseConnection)

	serverAddress := fmt.Sprintf(":%s", appConfig.AppPort)
	log.Printf("%s is running on port %s", appConfig.AppName, appConfig.AppPort)

	if listenError := coreService.FiberApp.Listen(serverAddress); listenError != nil {
		log.Fatalf("server failed to start: %v", listenError)
	}
}
