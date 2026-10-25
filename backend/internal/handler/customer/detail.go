package customer

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsCustomer "dyf-backend/statics/constants/customer"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Detail(fiberContext fiber.Ctx) error {
	customerID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidCustomerID, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.Detail(customerID)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCustomer.MsgCustomerFetchedSuccessfully, serviceResponse, nil)
}
