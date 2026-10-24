package auth

const (
	PurposeAdminLogin    = "ADMIN_LOGIN"
	PurposeCatalogLogin  = "CATALOG_LOGIN"
	PurposeCustomerLogin = "CUSTOMER_LOGIN"
	DefaultCodeLength    = 5
	MaxRequestsWindowSec = 600
	MaxRequestsPerWindow = 3
	MaxVerifyAttempts    = 5

	UserTypeAdmin        = "ADMIN"
	UserTypeCatalog      = "CATALOG"
	UserTypeCustomer     = "CUSTOMER"
	DeviceStatusActive   = "ACTIVE"
	DeviceStatusInactive = "INACTIVE"
	DeviceStatusExpired  = "EXPIRED"

	MsgOTPSentSuccessfully        = "کد تایید با موفقیت ارسال شد"
	MsgLoginSuccessfully          = "ورود با موفقیت انجام شد"
	MsgLogoutSuccessfully         = "خروج از حساب با موفقیت انجام شد"
	MsgProfileFetchedSuccessfully = "اطلاعات حساب کاربری با موفقیت دریافت شد"
	MsgShoesFetchedSuccessfully   = "فهرست محصولات مجاز با موفقیت دریافت شد"
)
