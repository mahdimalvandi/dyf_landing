package errors

var PersianErrorRegistry = map[string]string{
	UserNotFound:           "کاربر مورد نظر یافت نشد",
	NotFound:               "آیتم مورد نظر یافت نشد",
	ValidationFailed:       "داده‌های ارسالی معتبر نیستند",
	Unauthorized:           "احراز هویت انجام نشده است",
	Forbidden:              "دسترسی به این بخش مجاز نمی‌باشد",
	DuplicatePhone:         "شماره تلفن همراه از قبل در سیستم ثبت شده است",
	DuplicateSlug:          "شناسه لاتین وارد شده تکراری است",
	InvalidOTP:             "کد تایید وارد شده نادرست است",
	OTPExpired:             "کد تایید منقضی شده است",
	LinkExpired:            "مهلت زمانی این لینک به پایان رسیده است",
	LinkInactive:           "این لینک توسط مدیریت غیرفعال شده است",
	CustomerInactive:       "حساب کاربری مشتری غیرفعال است",
	AdminInactive:          "حساب کاربری مدیر غیرفعال است",
	OTPCooldownActive:      "کد تایید قبلاً ارسال شده است؛ لطفاً کمی صبر کرده و مجدداً تلاش کنید",
	TooManyRequests:        "تعداد درخواست‌ها بیش از حد مجاز است؛ لطفاً دقایقی دیگر تلاش کنید",
	SMSDeliveryFailed:      "خطا در ارسال پیامک؛ لطفاً مجدداً تلاش کنید",
	InternalServerError:    "خطای غیرمنتظره در سرور رخ داد",
	InvalidRequestBody:     "ساختار داده‌های ارسالی نامعتبر است",
	InvalidIDParam:         "شناسه ارسال شده در آدرس نامعتبر است",
	CategoryNotFound:       "دسته‌بندی مورد نظر یافت نشد",
	CategoryTitleDuplicate: "دسته‌بندی با این عنوان از قبل وجود دارد",
	InvalidCategoryID:      "شناسه دسته‌بندی نامعتبر است",
}

func TranslateToPersian(targetError error) string {
	if targetError == nil {
		return ""
	}
	if persianText, exists := PersianErrorRegistry[targetError.Error()]; exists {
		return persianText
	}
	return "خطای ناشناخته رخ داده است"
}
