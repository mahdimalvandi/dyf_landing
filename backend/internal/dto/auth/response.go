package auth

type SendOTPResponse struct {
	ExpiresInSeconds int `json:"expiresInSeconds"`
}

type AdminProfileResponse struct {
	ID          int64  `json:"ID"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	PhoneNumber string `json:"phoneNumber"`
}

type VerifyOTPResponse struct {
	Admin AdminProfileResponse `json:"admin"`
	Token string               `json:"token,omitempty"`
}
