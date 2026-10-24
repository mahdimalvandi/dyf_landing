package link

import (
	dtoCustomer "dyf-backend/internal/dto/customer"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) CustomerVerifyOTP(fiberContext fiber.Ctx) error {
	var requestBody dtoCustomer.CustomerVerifyOTPRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.VerifyCustomerOTP(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgLoginSuccessfully, serviceResponse, nil)
}
