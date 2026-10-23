package shoe

import (
	dtoShoe "dyf-backend/internal/dto/shoe"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsShoe "dyf-backend/statics/constants/shoe"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Create(fiberContext fiber.Ctx) error {
	var requestBody dtoShoe.CreateShoeRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Create(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgShoeCreatedSuccessfully, serviceResponse, nil)
}
