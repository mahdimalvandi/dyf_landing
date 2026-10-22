package errors

var PersianErrorRegistry = map[string]string{
	UserNotFound:        "کاربر مورد نظر یافت نشد",
	NotFound:            "آیتم مورد نظر یافت نشد",
	ValidationFailed:    "داده‌های ارسالی معتبر نیستند",
	Unauthorized:        "احراز هویت انجام نشده است",
	Forbidden:           "دسترسی به این بخش مجاز نمی‌باشد",
	DuplicatePhone:      "شماره تلفن همراه از قبل در سیستم ثبت شده است",
	DuplicateSlug:       "شناسه لاتین وارد شده تکراری است",
	InvalidOTP:          "کد تایید وارد شده نادرست است",
	OTPExpired:          "کد تایید منقضی شده است",
	LinkExpired:         "مهلت زمانی این لینک به پایان رسیده است",
	LinkInactive:        "این لینک توسط مدیریت غیرفعال شده است",
	CustomerInactive:    "حساب کاربری مشتری غیرفعال است",
	InternalServerError: "خطای غیرمنتظره در سرور رخ داد",
	InvalidRequestBody:  "ساختار داده‌های ارسالی نامعتبر است",
	InvalidIDParam:      "شناسه ارسال شده در آدرس نامعتبر است",
}

func TranslateToPersian(err error) string {
	if err == nil {
		return ""
	}
	if persianText, exists := PersianErrorRegistry[err.Error()]; exists {
		return persianText
	}
	return "خطای ناشناخته رخ داده است"
}
