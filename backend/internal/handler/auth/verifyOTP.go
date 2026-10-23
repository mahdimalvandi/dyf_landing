package auth

import (
	dtoAuth "dyf-backend/internal/dto/auth"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsAuth "dyf-backend/statics/constants/auth"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) VerifyOTP(fiberContext fiber.Ctx) error {
	var requestBody dtoAuth.VerifyOTPRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.VerifyOTP(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsAuth.MsgLoginSuccessfully, serviceResponse, nil)
}
