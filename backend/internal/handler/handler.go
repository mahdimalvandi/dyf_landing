package handler

import (
	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v2"
)

// BaseHandler encapsulates shared handler functionality
type BaseHandler struct{}

func NewBaseHandler() *BaseHandler {
	return &BaseHandler{}
}

// HealthCheck provides a simple system status check
func (h *BaseHandler) HealthCheck(c *fiber.Ctx) error {
	return response.Success(c, fiber.StatusOK, "سرویس کاتالوگ خصوصی DYF فعال است", fiber.Map{
		"status":  "operational",
		"service": "dyf-catalog-backend",
	}, nil)
}
