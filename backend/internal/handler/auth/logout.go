package auth

import (
	serviceauth "dyf-backend/internal/service/auth"
	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v3"
)

type LogoutHandler struct {
	service serviceauth.LogoutService
}

func NewLogoutHandler(service serviceauth.LogoutService) LogoutHandler {
	return LogoutHandler{
		service: service,
	}
}

func (handler LogoutHandler) Handle(fiberContext fiber.Ctx) error {
	if executeError := handler.service.Execute(); executeError != nil {
		return response.FromError(fiberContext, fiber.StatusInternalServerError, executeError, nil)
	}

	return response.Success(fiberContext, fiber.StatusOK, "خروج از حساب با موفقیت انجام شد", nil, nil)
}
