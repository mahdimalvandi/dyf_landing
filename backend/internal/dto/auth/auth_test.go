package auth_test

import (
	"testing"

	dtoauth "dyf-backend/internal/dto/auth"
	"dyf-backend/pkg/validator"
)

func TestSendOTPRequestValidation(testInstance *testing.T) {
	validRequest := dtoauth.SendOTPRequest{
		PhoneNumber: "09121234567",
	}
	validRequest.Normalize()
	if issues := validator.ValidateStruct(validRequest); len(issues) > 0 {
		testInstance.Fatalf("expected valid request, got issues: %v", issues)
	}

	invalidPhones := []string{
		"",
		"0912",
		"0912123456",
		"091212345678",
		"08121234567",
		"abcdefghijk",
	}

	for _, invalidPhone := range invalidPhones {
		invalidRequest := dtoauth.SendOTPRequest{
			PhoneNumber: invalidPhone,
		}
		if issues := validator.ValidateStruct(invalidRequest); len(issues) == 0 {
			testInstance.Errorf("expected validation failure for phone '%s', but passed", invalidPhone)
		}
	}
}

func TestVerifyOTPRequestValidation(testInstance *testing.T) {
	validRequest := dtoauth.VerifyOTPRequest{
		PhoneNumber: "09121234567",
		Code:        "12345",
	}
	validRequest.Normalize()
	if issues := validator.ValidateStruct(validRequest); len(issues) > 0 {
		testInstance.Fatalf("expected valid request, got issues: %v", issues)
	}

	invalidCases := []struct {
		phoneNumber string
		code        string
	}{
		{"09121234567", ""},
		{"09121234567", "12"},
		{"09121234567", "1234567"},
		{"0912", "12345"},
	}

	for _, singleCase := range invalidCases {
		invalidRequest := dtoauth.VerifyOTPRequest{
			PhoneNumber: singleCase.phoneNumber,
			Code:        singleCase.code,
		}
		if issues := validator.ValidateStruct(invalidRequest); len(issues) == 0 {
			testInstance.Errorf("expected failure for phone '%s' and code '%s', but passed", singleCase.phoneNumber, singleCase.code)
		}
	}
}
