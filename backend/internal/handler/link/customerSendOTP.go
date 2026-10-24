package link

import (
	dtoCustomer "dyf-backend/internal/dto/customer"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) CustomerSendOTP(fiberContext fiber.Ctx) error {
	var requestBody dtoCustomer.CustomerSendOTPRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.SendCustomerOTP(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgOTPSentSuccessfully, serviceResponse, nil)
}
