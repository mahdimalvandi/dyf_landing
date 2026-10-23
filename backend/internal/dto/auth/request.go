package auth

type SendOTPRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,iran_phone"`
}

type VerifyOTPRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,iran_phone"`
	Code        string `json:"code" validate:"required,min=4,max=6"`
}
