package auth

import (
	dtoAuth "dyf-backend/internal/dto/auth"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	"github.com/gofiber/fiber/v3"
)

func (handler Handler) SendCustomerOTP(context fiber.Ctx) error {
	var payload dtoAuth.SendOTPRequest
	if parseError := request.ParseBody(context, &payload); parseError != nil {
		return nil
	}
	result, status, executeError := handler.service.SendCustomerOTP(payload)
	if executeError != nil {
		return response.FromError(context, status, executeError, nil)
	}
	return response.Success(context, status, "کد تأیید ارسال شد", result, nil)
}

func (handler Handler) VerifyCustomerOTP(context fiber.Ctx) error {
	var payload dtoAuth.VerifyOTPRequest
	if parseError := request.ParseBody(context, &payload); parseError != nil {
		return nil
	}
	result, status, executeError := handler.service.VerifyCustomerOTP(payload)
	if executeError != nil {
		return response.FromError(context, status, executeError, nil)
	}
	return response.Success(context, status, "ورود مشتری تأیید شد", result, nil)
}
