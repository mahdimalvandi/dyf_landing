package link

import (
	"strings"

	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Access(fiberContext fiber.Ctx) error {
	token := strings.TrimSpace(fiberContext.Params("token"))
	if token == "" {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrValidationFailed, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.Access(token)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgCatalogAccessRecorded, serviceResponse, nil)
}
