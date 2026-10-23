package category

import (
	dtoCategory "dyf-backend/internal/dto/category"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsCategory "dyf-backend/statics/constants/category"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Create(fiberContext fiber.Ctx) error {
	var requestBody dtoCategory.CreateCategoryRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Create(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCategory.MsgCategoryCreatedSuccessfully, serviceResponse, nil)
}
