package auth

import (
	"dyf-backend/pkg/response"
	constantsauth "dyf-backend/statics/constants/auth"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Logout(fiberContext fiber.Ctx) error {
	tokenHash, _ := fiberContext.Locals("tokenHash").(string)

	statusCode, executeError := handler.service.Logout(tokenHash)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsauth.MsgLogoutSuccessfully, nil, nil)
}
