package routes

import (
	handlerLink "dyf-backend/internal/handler/link"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoCategory "dyf-backend/internal/repository/category"
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
	authRepository := repoAuth.NewRepository(databaseConnection)
	categoryRepository := repoCategory.NewRepository(databaseConnection)
	linkService := serviceLink.NewService(
		linkRepository,
		shoeRepository,
		customerRepository,
		authRepository,
		categoryRepository,
	)
	linkHandler := handlerLink.NewHandler(linkService)

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
	apiGroup.Get("/catalog/:token/shoes", linkHandler.CatalogShoes)
	apiGroup.Post("/catalog/:token/otp/send", linkHandler.CatalogSendOTP)
	apiGroup.Post("/catalog/:token/otp/verify", linkHandler.CatalogVerifyOTP)

	apiGroup.Post("/auth/customer/otp/send", linkHandler.CustomerSendOTP)
	apiGroup.Post("/auth/customer/otp/verify", linkHandler.CustomerVerifyOTP)
	apiGroup.Get("/customer/shoes", linkHandler.CustomerShoes)
	apiGroup.Get("/catalog/shoes", linkHandler.CustomerShoes)

	catalogGroup := apiGroup.Group("/catalog", adminAuthMiddleware)
	catalogGroup.Get("/stats/views", linkHandler.Stats)
}
