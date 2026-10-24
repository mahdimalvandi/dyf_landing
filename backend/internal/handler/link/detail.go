package link

import (
	"strconv"

	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Detail(fiberContext fiber.Ctx) error {
	lookupIdentifier, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidLinkID, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.Detail(lookupIdentifier)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgLinkFetchedSuccessfully, serviceResponse, nil)
}
