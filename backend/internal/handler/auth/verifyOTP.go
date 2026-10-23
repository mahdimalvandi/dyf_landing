package auth

import (
	"errors"

	dtoauth "dyf-backend/internal/dto/auth"
	serviceauth "dyf-backend/internal/service/auth"
	"dyf-backend/pkg/response"
	"dyf-backend/pkg/validator"
	staticerrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

type VerifyOTPHandler struct {
	service serviceauth.VerifyOTPService
}

func NewVerifyOTPHandler(service serviceauth.VerifyOTPService) VerifyOTPHandler {
	return VerifyOTPHandler{
		service: service,
	}
}

func (handler VerifyOTPHandler) Handle(fiberContext fiber.Ctx) error {
	var request dtoauth.VerifyOTPRequest
	if bindError := fiberContext.Bind().Body(&request); bindError != nil {
		return response.FromError(fiberContext, fiber.StatusBadRequest, staticerrors.ErrInvalidRequestBody, nil)
	}

	request.Normalize()

	if validationIssues := validator.ValidateStruct(request); len(validationIssues) > 0 {
		return response.Error(
			fiberContext,
			fiber.StatusBadRequest,
			staticerrors.ValidationFailed,
			staticerrors.TranslateToPersian(staticerrors.ErrValidationFailed),
			validationIssues,
		)
	}

	serviceResponse, executeError := handler.service.Execute(request)
	if executeError != nil {
		statusCode := fiber.StatusInternalServerError
		if errors.Is(executeError, staticerrors.ErrInvalidOTP) || errors.Is(executeError, staticerrors.ErrOTPExpired) {
			statusCode = fiber.StatusBadRequest
		} else if errors.Is(executeError, staticerrors.ErrUserNotFound) {
			statusCode = fiber.StatusNotFound
		}
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, fiber.StatusOK, "ورود با موفقیت انجام شد", serviceResponse, nil)
}
