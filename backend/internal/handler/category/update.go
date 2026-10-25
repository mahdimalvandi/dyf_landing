package category

import (
	"strconv"

	dtoCategory "dyf-backend/internal/dto/category"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsCategory "dyf-backend/statics/constants/category"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Update(fiberContext fiber.Ctx) error {
	categoryID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidIDParam, nil)
	}

	var requestBody dtoCategory.UpdateCategoryRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Update(categoryID, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCategory.MsgCategoryUpdatedSuccessfully, serviceResponse, nil)
}
