package errors

import "errors"

const (
	UserNotFound         = "userNotFound"
	NotFound             = "notFound"
	ValidationFailed     = "validationFailed"
	Unauthorized         = "unauthorized"
	Forbidden            = "forbidden"
	DuplicatePhone       = "duplicatePhone"
	DuplicateSlug        = "duplicateSlug"
	InvalidOTP           = "invalidOTP"
	OTPExpired           = "otpExpired"
	LinkExpired          = "linkExpired"
	LinkInactive         = "linkInactive"
	CustomerInactive     = "customerInactive"
	InternalServerError  = "internalServerError"
	InvalidRequestBody   = "invalidRequestBody"
	InvalidIDParam       = "invalidIDParam"
)

var (
	ErrUserNotFound        = errors.New(UserNotFound)
	ErrNotFound            = errors.New(NotFound)
	ErrValidationFailed    = errors.New(ValidationFailed)
	ErrUnauthorized        = errors.New(Unauthorized)
	ErrForbidden           = errors.New(Forbidden)
	ErrDuplicatePhone      = errors.New(DuplicatePhone)
	ErrDuplicateSlug       = errors.New(DuplicateSlug)
	ErrInvalidOTP          = errors.New(InvalidOTP)
	ErrOTPExpired          = errors.New(OTPExpired)
	ErrLinkExpired         = errors.New(LinkExpired)
	ErrLinkInactive        = errors.New(LinkInactive)
	ErrCustomerInactive    = errors.New(CustomerInactive)
	ErrInternalServerError = errors.New(InternalServerError)
	ErrInvalidRequestBody  = errors.New(InvalidRequestBody)
	ErrInvalidIDParam      = errors.New(InvalidIDParam)
)
