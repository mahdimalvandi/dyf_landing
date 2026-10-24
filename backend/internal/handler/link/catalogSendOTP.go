package link

import (
	"strings"

	dtoLink "dyf-backend/internal/dto/link"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) CatalogSendOTP(fiberContext fiber.Ctx) error {
	token := strings.TrimSpace(fiberContext.Params("token"))
	if token == "" {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrValidationFailed, nil)
	}

	var requestBody dtoLink.CatalogSendOTPRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.SendCatalogOTP(token, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgOTPSentSuccessfully, serviceResponse, nil)
}
