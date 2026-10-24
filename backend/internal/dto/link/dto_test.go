package link_test

import (
	"testing"

	dtoLink "dyf-backend/internal/dto/link"
	"dyf-backend/pkg/validator"
)

func TestCatalogSendOTPRequest_Normalize(t *testing.T) {
	req := dtoLink.CatalogSendOTPRequest{
		PhoneNumber: " 09123456789 ",
	}
	req.Normalize()
	if req.PhoneNumber != "09123456789" {
		t.Fatalf("expected trimmed phone number, got %q", req.PhoneNumber)
	}

	issues := validator.ValidateStruct(req)
	if len(issues) > 0 {
		t.Fatalf("expected valid request, got issues: %v", issues)
	}
}

func TestCatalogSendOTPRequest_Validation(t *testing.T) {
	invalidReq := dtoLink.CatalogSendOTPRequest{
		PhoneNumber: "invalid",
	}
	invalidReq.Normalize()

	issues := validator.ValidateStruct(invalidReq)
	if len(issues) == 0 {
		t.Fatal("expected validation issues for invalid phone number")
	}
}

func TestCatalogVerifyOTPRequest_NormalizeAndValidation(t *testing.T) {
	req := dtoLink.CatalogVerifyOTPRequest{
		PhoneNumber: " 09123456789 ",
		Code:        " 12345 ",
	}
	req.Normalize()

	if req.PhoneNumber != "09123456789" {
		t.Fatalf("expected trimmed phone number, got %q", req.PhoneNumber)
	}
	if req.Code != "12345" {
		t.Fatalf("expected trimmed code, got %q", req.Code)
	}

	issues := validator.ValidateStruct(req)
	if len(issues) > 0 {
		t.Fatalf("expected valid verify request, got: %v", issues)
	}

	invalidReq := dtoLink.CatalogVerifyOTPRequest{
		PhoneNumber: "09123456789",
		Code:        "123",
	}
	invalidReq.Normalize()
	issues = validator.ValidateStruct(invalidReq)
	if len(issues) == 0 {
		t.Fatal("expected validation issue for short code")
	}
}

func TestCreateLinkRequest_Normalize(t *testing.T) {
	req := dtoLink.CreateLinkRequest{
		RecipientName: "   Customer Name   ",
		PhoneNumber:   "  09123456789  ",
		ShoeIDs:       []int64{1, 2, 2, 3, 0, -1},
	}
	req.Normalize()

	if req.RecipientName != "Customer Name" {
		t.Fatalf("expected trimmed recipient name, got %q", req.RecipientName)
	}
	if req.PhoneNumber != "09123456789" {
		t.Fatalf("expected trimmed phone, got %q", req.PhoneNumber)
	}
	if req.AuthMethod != "DIRECT" {
		t.Fatalf("expected default auth method DIRECT, got %q", req.AuthMethod)
	}
	if len(req.ShoeIDs) != 3 {
		t.Fatalf("expected 3 unique positive shoe IDs, got %v", req.ShoeIDs)
	}
}
