package routes

import (
	handlerLink "dyf-backend/internal/handler/link"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoCustomer "dyf-backend/internal/repository/customer"
	repoLink "dyf-backend/internal/repository/link"
	repoShoe "dyf-backend/internal/repository/shoe"
	serviceLink "dyf-backend/internal/service/link"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterLinkRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	linkRepository := repoLink.NewRepository(databaseConnection)
	shoeRepository := repoShoe.NewRepository(databaseConnection)
	customerRepository := repoCustomer.NewRepository(databaseConnection)
	linkService := serviceLink.NewService(linkRepository, shoeRepository, customerRepository)
	linkHandler := handlerLink.NewHandler(linkService)

	authRepository := repoAuth.NewRepository(databaseConnection)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	linksGroup := apiGroup.Group("/links", adminAuthMiddleware)
	linksGroup.Get("", linkHandler.List)
	linksGroup.Post("", linkHandler.Create)
	linksGroup.Get("/:id", linkHandler.Detail)
	linksGroup.Put("/:id", linkHandler.Update)
	linksGroup.Patch("/:id/revoke", linkHandler.Revoke)
	linksGroup.Patch("/:id/reactivate", linkHandler.Reactivate)
	linksGroup.Delete("/:id", linkHandler.Delete)

	apiGroup.Post("/catalog/:token/access", linkHandler.Access)

	catalogGroup := apiGroup.Group("/catalog", adminAuthMiddleware)
	catalogGroup.Get("/stats/views", linkHandler.Stats)
}
