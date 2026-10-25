package request

import (
	"dyf-backend/pkg/response"
	"dyf-backend/pkg/validator"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

type Normalizable interface {
	Normalize()
}

func ParseBody(fiberContext fiber.Ctx, targetStruct any) error {
	if bindError := fiberContext.Bind().Body(targetStruct); bindError != nil {
		_ = response.FromError(fiberContext, fiber.StatusBadRequest, staticErrors.ErrInvalidRequestBody, nil)
		return staticErrors.ErrInvalidRequestBody
	}

	if normalizer, isNormalizable := targetStruct.(Normalizable); isNormalizable {
		normalizer.Normalize()
	}

	if validationIssues := validator.ValidateStruct(targetStruct); len(validationIssues) > 0 {
		_ = response.Error(
			fiberContext,
			fiber.StatusBadRequest,
			staticErrors.ValidationFailed,
			staticErrors.TranslateToPersian(staticErrors.ErrValidationFailed),
			validationIssues,
		)
		return staticErrors.ErrValidationFailed
	}

	return nil
}
