package routes

import (
	handlerCustomer "dyf-backend/internal/handler/customer"
	"dyf-backend/internal/middleware"
	repoAuth "dyf-backend/internal/repository/auth"
	repoCustomer "dyf-backend/internal/repository/customer"
	serviceCustomer "dyf-backend/internal/service/customer"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func RegisterCustomerRoutes(apiGroup fiber.Router, databaseConnection *gorm.DB) {
	customerRepository := repoCustomer.NewRepository(databaseConnection)
	customerService := serviceCustomer.NewService(customerRepository)
	customerHandler := handlerCustomer.NewHandler(customerService)

	authRepository := repoAuth.NewRepository(databaseConnection)
	adminAuthMiddleware := middleware.RequireAdminAuth(authRepository)

	customersGroup := apiGroup.Group("/customers", adminAuthMiddleware)
	customersGroup.Get("", customerHandler.List)
	customersGroup.Post("", customerHandler.Create)
	customersGroup.Get("/:id", customerHandler.Detail)
	customersGroup.Put("/:id", customerHandler.Update)
	customersGroup.Patch("/:id/status", customerHandler.ChangeStatus)
	customersGroup.Delete("/:id", customerHandler.Delete)
}
