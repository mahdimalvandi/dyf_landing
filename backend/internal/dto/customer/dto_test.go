package customer_test

import (
	"testing"

	dtoCustomer "dyf-backend/internal/dto/customer"
	"dyf-backend/pkg/validator"
)

func TestCustomerSendOTPRequest_NormalizeAndValidation(t *testing.T) {
	req := dtoCustomer.CustomerSendOTPRequest{
		PhoneNumber: "  09121234567  ",
	}
	req.Normalize()

	if req.PhoneNumber != "09121234567" {
		t.Fatalf("expected trimmed phone number, got %q", req.PhoneNumber)
	}

	issues := validator.ValidateStruct(req)
	if len(issues) > 0 {
		t.Fatalf("expected no validation issues, got %v", issues)
	}

	badReq := dtoCustomer.CustomerSendOTPRequest{
		PhoneNumber: "123",
	}
	badReq.Normalize()
	if len(validator.ValidateStruct(badReq)) == 0 {
		t.Fatal("expected validation failure for short phone number")
	}
}

func TestCustomerVerifyOTPRequest_NormalizeAndValidation(t *testing.T) {
	req := dtoCustomer.CustomerVerifyOTPRequest{
		PhoneNumber: " 09121234567 ",
		Code:        " 54321 ",
	}
	req.Normalize()

	if req.PhoneNumber != "09121234567" {
		t.Fatalf("expected trimmed phone, got %q", req.PhoneNumber)
	}
	if req.Code != "54321" {
		t.Fatalf("expected trimmed code, got %q", req.Code)
	}

	issues := validator.ValidateStruct(req)
	if len(issues) > 0 {
		t.Fatalf("expected valid struct, got %v", issues)
	}
}
