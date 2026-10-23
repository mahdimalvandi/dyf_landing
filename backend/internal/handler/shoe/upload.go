package shoe

import (
	"dyf-backend/pkg/response"
	constantsShoe "dyf-backend/statics/constants/shoe"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) UploadMedia(fiberContext fiber.Ctx) error {
	uploadedFileHeader, formFileError := fiberContext.FormFile("file")
	if formFileError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidMediaFile, nil)
	}

	serviceResponse, statusCode, executeError := handler.service.SaveUploadedFile(uploadedFileHeader)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgMediaUploadedSuccessfully, serviceResponse, nil)
}
