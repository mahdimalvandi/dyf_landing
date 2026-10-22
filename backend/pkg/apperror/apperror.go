package apperror

import (
	"errors"
)

type CustomError struct {
	errorCode string
}

func New(errorCode string) CustomError {
	return CustomError{
		errorCode: errorCode,
	}
}

func (customError CustomError) Error() string {
	return customError.errorCode
}

func (customError CustomError) Code() string {
	return customError.errorCode
}

var (
	ErrNotFound           = New("NOT_FOUND")
	ErrValidationFailed   = New("VALIDATION_FAILED")
	ErrUnauthorized       = New("UNAUTHORIZED")
	ErrForbidden          = New("FORBIDDEN")
	ErrDuplicatePhone     = New("DUPLICATE_PHONE")
	ErrInvalidOTP         = New("INVALID_OTP")
	ErrOTPExpired         = New("OTP_EXPIRED")
	ErrLinkExpired        = New("LINK_EXPIRED")
	ErrLinkInactive       = New("LINK_INACTIVE")
	ErrCustomerInactive   = New("CUSTOMER_INACTIVE")
	ErrInternalServer     = New("INTERNAL_SERVER_ERROR")
)

type ErrorDetails struct {
	StatusCode int
	MessageFa  string
}

var persianErrorRegistry = map[string]ErrorDetails{
	"NOT_FOUND": {
		StatusCode: 404,
		MessageFa:  "آیتم مورد نظر یافت نشد",
	},
	"VALIDATION_FAILED": {
		StatusCode: 422,
		MessageFa:  "داده‌های ارسالی معتبر نیستند",
	},
	"UNAUTHORIZED": {
		StatusCode: 401,
		MessageFa:  "احراز هویت انجام نشده است",
	},
	"FORBIDDEN": {
		StatusCode: 403,
		MessageFa:  "دسترسی مجاز نمی‌باشد",
	},
	"DUPLICATE_PHONE": {
		StatusCode: 409,
		MessageFa:  "شماره تلفن همراه از قبل در سیستم وجود دارد",
	},
	"INVALID_OTP": {
		StatusCode: 400,
		MessageFa:  "کد تایید وارد شده نادرست است",
	},
	"OTP_EXPIRED": {
		StatusCode: 410,
		MessageFa:  "کد تایید منقضی شده است",
	},
	"LINK_EXPIRED": {
		StatusCode: 410,
		MessageFa:  "مهلت زمانی این لینک به پایان رسیده است",
	},
	"LINK_INACTIVE": {
		StatusCode: 403,
		MessageFa:  "این لینک توسط مدیریت غیرفعال شده است",
	},
	"CUSTOMER_INACTIVE": {
		StatusCode: 403,
		MessageFa:  "حساب کاربری مشتری غیرفعال است",
	},
	"INTERNAL_SERVER_ERROR": {
		StatusCode: 500,
		MessageFa:  "خطای غیرمنتظره در سرور رخ داد",
	},
}

func Resolve(err error) (int, string, string) {
	if err == nil {
		return 200, "", ""
	}

	var customErr CustomError
	if errors.As(err, &customErr) {
		if mapping, exists := persianErrorRegistry[customErr.Code()]; exists {
			return mapping.StatusCode, customErr.Code(), mapping.MessageFa
		}
		return 400, customErr.Code(), customErr.Code()
	}

	return 500, "INTERNAL_SERVER_ERROR", "خطای غیرمنتظره در سرور رخ داد"
}
