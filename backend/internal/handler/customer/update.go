package customer

import (
	"strconv"

	dtoCustomer "dyf-backend/internal/dto/customer"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsCustomer "dyf-backend/statics/constants/customer"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Update(fiberContext fiber.Ctx) error {
	customerID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidCustomerID, nil)
	}

	var requestBody dtoCustomer.UpdateCustomerRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Update(customerID, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCustomer.MsgCustomerUpdatedSuccessfully, serviceResponse, nil)
}
