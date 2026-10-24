package link

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Reactivate(fiberContext fiber.Ctx) error {
	linkID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidLinkID, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.Reactivate(linkID)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgLinkReactivatedSuccessfully, serviceResponse, nil)
}
