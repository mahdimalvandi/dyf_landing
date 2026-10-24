package routes

import (
	handlerShoe "dyf-backend/internal/handler/shoe"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoCategory "dyf-backend/internal/repository/category"
	repoShoe "dyf-backend/internal/repository/shoe"
	serviceShoe "dyf-backend/internal/service/shoe"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterShoeRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	shoeRepository := repoShoe.NewRepository(databaseConnection)
	categoryRepository := repoCategory.NewRepository(databaseConnection)
	shoeService := serviceShoe.NewService(shoeRepository, categoryRepository)
	shoeHandler := handlerShoe.NewHandler(shoeService)

	authRepository := repoAuth.NewRepository(databaseConnection)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	shoesGroup := apiGroup.Group("/shoes", adminAuthMiddleware)
	shoesGroup.Get("", shoeHandler.List)
	shoesGroup.Post("", shoeHandler.Create)
	shoesGroup.Post("/upload", shoeHandler.UploadMedia)
	shoesGroup.Get("/:id", shoeHandler.Detail)
	shoesGroup.Put("/:id", shoeHandler.Update)
	shoesGroup.Delete("/:id", shoeHandler.Delete)
	shoesGroup.Put("/:id/cover", shoeHandler.SetCover)
	shoesGroup.Delete("/:id/media", shoeHandler.RemoveMedia)
}
