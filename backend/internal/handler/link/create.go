package link

import (
	dtoLink "dyf-backend/internal/dto/link"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Create(fiberContext fiber.Ctx) error {
	var requestBody dtoLink.CreateLinkRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Create(requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgLinkCreatedSuccessfully, serviceResponse, nil)
}
