package link_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	handlerLink "dyf-backend/internal/handler/link"
	"dyf-backend/internal/middleware"
	serviceLink "dyf-backend/internal/service/link"

	"github.com/gofiber/fiber/v3"
)

func setupTestApp() *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.GlobalErrorHandler,
	})
	handler := handlerLink.NewHandler(serviceLink.Service{})

	app.Post("/catalog/:token/otp/send", handler.CatalogSendOTP)
	app.Post("/catalog/:token/otp/verify", handler.CatalogVerifyOTP)
	app.Post("/auth/customer/otp/send", handler.CustomerSendOTP)
	app.Post("/auth/customer/otp/verify", handler.CustomerVerifyOTP)

	return app
}

func TestCatalogSendOTP_InvalidBody(t *testing.T) {
	app := setupTestApp()

	body := []byte(`{"phoneNumber": "not-a-number"}`)
	req := httptest.NewRequest(http.MethodPost, "/catalog/test-token/otp/send", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected app.Test error: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", resp.StatusCode)
	}
}

func TestCatalogVerifyOTP_InvalidBody(t *testing.T) {
	app := setupTestApp()

	body := []byte(`{"phoneNumber": "09121234567", "code": "12"}`)
	req := httptest.NewRequest(http.MethodPost, "/catalog/test-token/otp/verify", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected app.Test error: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", resp.StatusCode)
	}
}

func TestCustomerSendOTP_InvalidBody(t *testing.T) {
	app := setupTestApp()

	payload := map[string]string{"phoneNumber": "123"}
	marshaled, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/auth/customer/otp/send", bytes.NewReader(marshaled))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected app.Test error: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", resp.StatusCode)
	}
}

func TestCustomerVerifyOTP_InvalidBody(t *testing.T) {
	app := setupTestApp()

	payload := map[string]string{"phoneNumber": "09121234567", "code": "abc"}
	marshaled, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/auth/customer/otp/verify", bytes.NewReader(marshaled))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected app.Test error: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", resp.StatusCode)
	}
}
