package link

import (
	"strconv"

	dtoLink "dyf-backend/internal/dto/link"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Update(fiberContext fiber.Ctx) error {
	linkID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidLinkID, nil)
	}

	var requestBody dtoLink.UpdateLinkRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.Update(linkID, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgLinkUpdatedSuccessfully, serviceResponse, nil)
}
