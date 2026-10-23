package category

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsCategory "dyf-backend/statics/constants/category"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Detail(fiberContext fiber.Ctx) error {
	categoryID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidIDParam, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.Detail(categoryID)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCategory.MsgCategoryFetchedSuccessfully, serviceResponse, nil)
}
