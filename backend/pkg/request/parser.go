package request

import (
	"dyf-backend/pkg/response"
	"dyf-backend/pkg/validator"
	staticerrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

type Normalizable interface {
	Normalize()
}

func ParseBody(fiberContext fiber.Ctx, targetStruct any) error {
	if bindError := fiberContext.Bind().Body(targetStruct); bindError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticerrors.ErrInvalidRequestBody, nil)
	}

	if normalizer, isNormalizable := targetStruct.(Normalizable); isNormalizable {
		normalizer.Normalize()
	}

	if validationIssues := validator.ValidateStruct(targetStruct); len(validationIssues) > 0 {
		return response.Error(
			fiberContext,
			fiber.StatusBadRequest,
			staticerrors.ValidationFailed,
			staticerrors.TranslateToPersian(staticerrors.ErrValidationFailed),
			validationIssues,
		)
	}

	return nil
}
