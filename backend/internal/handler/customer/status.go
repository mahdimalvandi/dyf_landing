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

func (handler Handler) ChangeStatus(fiberContext fiber.Ctx) error {
	customerID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidCustomerID, nil)
	}

	var requestBody dtoCustomer.ChangeCustomerStatusRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.ChangeStatus(customerID, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCustomer.MsgCustomerStatusUpdatedSuccessfully, serviceResponse, nil)
}
