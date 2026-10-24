package link

import (
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Stats(fiberContext fiber.Ctx) error {
	serviceResponse, statusCode, executeError := handler.service.Stats()
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgCatalogStatsFetched, serviceResponse, nil)
}
