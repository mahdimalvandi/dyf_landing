package handler

import (
	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v3"
)

type BaseHandler struct{}

func NewBaseHandler() BaseHandler {
	return BaseHandler{}
}

func (baseHandler BaseHandler) HealthCheck(fiberContext fiber.Ctx) error {
	return response.Success(fiberContext, fiber.StatusOK, "سرویس کاتالوگ اختصاصی فعال است", map[string]string{
		"status":  "operational",
		"service": "dyf-catalog-backend",
	}, nil)
}
