package shoe

import (
	"strconv"

	dtoShoe "dyf-backend/internal/dto/shoe"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	constantsShoe "dyf-backend/statics/constants/shoe"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) SetCover(fiberContext fiber.Ctx) error {
	shoeID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidShoeID, nil)
	}

	var requestBody dtoShoe.SetCoverRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.SetCover(shoeID, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgCoverUpdatedSuccessfully, serviceResponse, nil)
}

func (handler Handler) RemoveMedia(fiberContext fiber.Ctx) error {
	shoeID, parseIDError := strconv.ParseInt(fiberContext.Params("id"), 10, 64)
	if parseIDError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidShoeID, nil)
	}

	var requestBody dtoShoe.RemoveMediaRequest
	if parseError := request.ParseBody(fiberContext, &requestBody); parseError != nil {
		return parseError
	}

	serviceResponse, statusCode, executeError := handler.service.RemoveMedia(shoeID, requestBody)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgMediaRemovedSuccessfully, serviceResponse, nil)
}
