package routes

import (
	handlerDashboard "dyf-backend/internal/handler/dashboard"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoDashboard "dyf-backend/internal/repository/dashboard"
	serviceDashboard "dyf-backend/internal/service/dashboard"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterDashboardRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	dashboardRepository := repoDashboard.NewRepository(databaseConnection)
	dashboardService := serviceDashboard.NewService(dashboardRepository)
	dashboardHandler := handlerDashboard.NewHandler(dashboardService)

	authRepository := repoAuth.NewRepository(databaseConnection)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	dashboardGroup := apiGroup.Group("/dashboard", adminAuthMiddleware)
	dashboardGroup.Get("", dashboardHandler.Overview)
}
