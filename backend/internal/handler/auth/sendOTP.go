package auth

import (
	dtoauth "dyf-backend/internal/dto/auth"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) SendOTP(fiberContext fiber.Ctx) error {
	var requestBody dtoauth.SendOTPRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.SendOTP(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, "کد تایید با موفقیت ارسال شد", serviceResponse, nil)
}
