package category

import (
	"dyf-backend/pkg/response"
	constantsCategory "dyf-backend/statics/constants/category"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) List(fiberContext fiber.Ctx) error {
	serviceResponse, statusCode, executeError := handler.service.List()
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCategory.MsgCategoryListFetchedSuccessfully, serviceResponse, nil)
}
