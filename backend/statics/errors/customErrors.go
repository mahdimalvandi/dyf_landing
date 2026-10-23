package errors

import "errors"

const (
	UserNotFound            = "userNotFound"
	NotFound                = "notFound"
	ValidationFailed        = "validationFailed"
	Unauthorized            = "unauthorized"
	Forbidden               = "forbidden"
	DuplicatePhone          = "duplicatePhone"
	DuplicateSlug           = "duplicateSlug"
	InvalidOTP              = "invalidOTP"
	OTPExpired              = "otpExpired"
	LinkExpired             = "linkExpired"
	LinkInactive            = "linkInactive"
	CustomerInactive        = "customerInactive"
	AdminInactive           = "adminInactive"
	OTPCooldownActive       = "otpCooldownActive"
	TooManyRequests         = "tooManyRequests"
	SMSDeliveryFailed       = "smsDeliveryFailed"
	InternalServerError     = "internalServerError"
	InvalidRequestBody      = "invalidRequestBody"
	InvalidIDParam          = "invalidIDParam"
	CategoryNotFound        = "categoryNotFound"
	CategoryTitleDuplicate  = "categoryTitleDuplicate"
	InvalidCategoryID       = "invalidCategoryID"
	ShoeNotFound            = "shoeNotFound"
	InvalidShoeID           = "invalidShoeID"
	CategoryNotFoundForShoe = "categoryNotFoundForShoe"
	MediaNotFound           = "mediaNotFound"
	InvalidMediaFile        = "invalidMediaFile"
	MediaSizeExceeded       = "mediaSizeExceeded"
	UploadFailed            = "uploadFailed"
	CustomerNotFound        = "customerNotFound"
	InvalidCustomerID       = "invalidCustomerID"
)

var (
	ErrUserNotFound            = errors.New(UserNotFound)
	ErrNotFound                = errors.New(NotFound)
	ErrValidationFailed        = errors.New(ValidationFailed)
	ErrUnauthorized            = errors.New(Unauthorized)
	ErrForbidden               = errors.New(Forbidden)
	ErrDuplicatePhone          = errors.New(DuplicatePhone)
	ErrDuplicateSlug           = errors.New(DuplicateSlug)
	ErrInvalidOTP              = errors.New(InvalidOTP)
	ErrOTPExpired              = errors.New(OTPExpired)
	ErrLinkExpired             = errors.New(LinkExpired)
	ErrLinkInactive            = errors.New(LinkInactive)
	ErrCustomerInactive        = errors.New(CustomerInactive)
	ErrAdminInactive           = errors.New(AdminInactive)
	ErrOTPCooldownActive       = errors.New(OTPCooldownActive)
	ErrTooManyRequests         = errors.New(TooManyRequests)
	ErrSMSDeliveryFailed       = errors.New(SMSDeliveryFailed)
	ErrInternalServerError     = errors.New(InternalServerError)
	ErrInvalidRequestBody      = errors.New(InvalidRequestBody)
	ErrInvalidIDParam          = errors.New(InvalidIDParam)
	ErrCategoryNotFound        = errors.New(CategoryNotFound)
	ErrCategoryTitleDuplicate  = errors.New(CategoryTitleDuplicate)
	ErrInvalidCategoryID       = errors.New(InvalidCategoryID)
	ErrShoeNotFound            = errors.New(ShoeNotFound)
	ErrInvalidShoeID           = errors.New(InvalidShoeID)
	ErrCategoryNotFoundForShoe = errors.New(CategoryNotFoundForShoe)
	ErrMediaNotFound           = errors.New(MediaNotFound)
	ErrInvalidMediaFile        = errors.New(InvalidMediaFile)
	ErrMediaSizeExceeded       = errors.New(MediaSizeExceeded)
	ErrUploadFailed            = errors.New(UploadFailed)
	ErrCustomerNotFound        = errors.New(CustomerNotFound)
	ErrInvalidCustomerID       = errors.New(InvalidCustomerID)
)
