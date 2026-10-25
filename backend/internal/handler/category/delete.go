package category

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsCategory "dyf-backend/statics/constants/category"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Delete(fiberContext fiber.Ctx) error {
	categoryID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidIDParam, nil)
	}

	statusCode, executeError := handler.service.Delete(categoryID)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCategory.MsgCategoryDeletedSuccessfully, nil, nil)
}
