package shoe

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsShoe "dyf-backend/statics/constants/shoe"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Detail(fiberContext fiber.Ctx) error {
	identifier, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidShoeID, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.Detail(identifier)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgShoeFetchedSuccessfully, serviceResponse, nil)
}
