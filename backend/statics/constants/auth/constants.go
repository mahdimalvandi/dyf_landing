package auth

const (
	PurposeAdminLogin    = "ADMIN_LOGIN"
	DefaultCodeLength    = 5
	MaxRequestsWindowSec = 600
	MaxRequestsPerWindow = 3

	MsgOTPSentSuccessfully = "کد تایید با موفقیت ارسال شد"
	MsgLoginSuccessfully   = "ورود با موفقیت انجام شد"
	MsgLogoutSuccessfully  = "خروج از حساب با موفقیت انجام شد"
)
