package link

import (
	"strings"

	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) CatalogShoes(fiberContext fiber.Ctx) error {
	token := strings.TrimSpace(fiberContext.Params("token"))
	if token == "" {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrValidationFailed, nil)
	}

	sessionRawToken := extractSessionToken(fiberContext)
	serviceResponse, statusCode, executeError := handler.service.GetCatalogShoes(token, sessionRawToken)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgShoesFetchedSuccessfully, serviceResponse, nil)
}
