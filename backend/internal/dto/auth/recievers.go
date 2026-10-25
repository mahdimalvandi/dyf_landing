package auth

import "strings"

func (request *SendOTPRequest) Normalize() {
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
}

func (request *VerifyOTPRequest) Normalize() {
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
	request.Code = strings.TrimSpace(request.Code)
}
