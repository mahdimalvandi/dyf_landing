package errors_test

import (
	"testing"

	staticerrors "dyf-backend/statics/errors"
)

func TestErrorTranslations(testInstance *testing.T) {
	checkedErrors := []error{
		staticerrors.ErrUserNotFound,
		staticerrors.ErrNotFound,
		staticerrors.ErrValidationFailed,
		staticerrors.ErrUnauthorized,
		staticerrors.ErrForbidden,
		staticerrors.ErrDuplicatePhone,
		staticerrors.ErrDuplicateSlug,
		staticerrors.ErrInvalidOTP,
		staticerrors.ErrOTPExpired,
		staticerrors.ErrLinkExpired,
		staticerrors.ErrLinkInactive,
		staticerrors.ErrCustomerInactive,
		staticerrors.ErrAdminInactive,
		staticerrors.ErrOTPCooldownActive,
		staticerrors.ErrTooManyRequests,
		staticerrors.ErrSMSDeliveryFailed,
		staticerrors.ErrInternalServerError,
		staticerrors.ErrInvalidRequestBody,
		staticerrors.ErrInvalidIDParam,
	}

	for _, singleError := range checkedErrors {
		persianTranslation := staticerrors.TranslateToPersian(singleError)
		if persianTranslation == "" || persianTranslation == "خطای ناشناخته رخ داده است" {
			testInstance.Errorf("missing persian translation for error: %s", singleError.Error())
		}
	}
}
