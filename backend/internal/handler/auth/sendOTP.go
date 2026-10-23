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

type SendOTPHandler struct {
	service serviceauth.SendOTPService
}

func NewSendOTPHandler(service serviceauth.SendOTPService) SendOTPHandler {
	return SendOTPHandler{
		service: service,
	}
}

func (handler SendOTPHandler) Handle(fiberContext fiber.Ctx) error {
	var request dtoauth.SendOTPRequest
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
		if errors.Is(executeError, staticerrors.ErrUserNotFound) {
			statusCode = fiber.StatusNotFound
		} else if errors.Is(executeError, staticerrors.ErrAdminInactive) {
			statusCode = fiber.StatusForbidden
		} else if errors.Is(executeError, staticerrors.ErrOTPCooldownActive) || errors.Is(executeError, staticerrors.ErrTooManyRequests) {
			statusCode = fiber.StatusTooManyRequests
		} else if errors.Is(executeError, staticerrors.ErrSMSDeliveryFailed) {
			statusCode = fiber.StatusBadGateway
		}
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, fiber.StatusOK, "کد تایید با موفقیت ارسال شد", serviceResponse, nil)
}
