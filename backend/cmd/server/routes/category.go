package routes

import (
	handlerCategory "dyf-backend/internal/handler/category"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoCategory "dyf-backend/internal/repository/category"
	serviceCategory "dyf-backend/internal/service/category"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterCategoryRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	categoryRepository := repoCategory.NewRepository(databaseConnection)
	categoryService := serviceCategory.NewService(categoryRepository)
	categoryHandler := handlerCategory.NewHandler(categoryService)

	authRepository := repoAuth.NewRepository(databaseConnection)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	categoriesGroup := apiGroup.Group("/categories")
	categoriesGroup.Get("", categoryHandler.List)
	categoriesGroup.Get("/:id", categoryHandler.Detail)

	protectedCategoriesGroup := categoriesGroup.Group("", adminAuthMiddleware)
	protectedCategoriesGroup.Post("", categoryHandler.Create)
	protectedCategoriesGroup.Put("/:id", categoryHandler.Update)
	protectedCategoriesGroup.Delete("/:id", categoryHandler.Delete)
}
