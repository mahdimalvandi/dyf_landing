package shoe

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsShoe "dyf-backend/statics/constants/shoe"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Delete(fiberContext fiber.Ctx) error {
	shoeID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidShoeID, nil)
	}

	statusCode, executeError := handler.service.Delete(shoeID)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgShoeDeletedSuccessfully, nil, nil)
}
