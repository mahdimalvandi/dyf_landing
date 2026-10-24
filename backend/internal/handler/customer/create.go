package customer

import (
	dtoCustomer "dyf-backend/internal/dto/customer"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsCustomer "dyf-backend/statics/constants/customer"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Create(fiberContext fiber.Ctx) error {
	var requestBody dtoCustomer.CreateCustomerRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Create(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCustomer.MsgCustomerCreatedSuccessfully, serviceResponse, nil)
}
