package auth

import (
	"dyf-backend/pkg/response"
	constantsAuth "dyf-backend/statics/constants/auth"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Me(fiberContext fiber.Ctx) error {
	userID, isInteger := fiberContext.Locals("userID").(int64)
	if !isInteger {
		return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
	}

	profileResponse, statusCode, executeError := handler.service.Me(userID)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsAuth.MsgProfileFetchedSuccessfully, profileResponse, nil)
}
