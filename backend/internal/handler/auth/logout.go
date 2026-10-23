package auth

import (
	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Logout(fiberContext fiber.Ctx) error {
	statusCode, executeError := handler.service.Logout()
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, "خروج از حساب با موفقیت انجام شد", nil, nil)
}
