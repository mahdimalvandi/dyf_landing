package routes

import (
	"dyf-backend/pkg/media"
	"github.com/gofiber/fiber/v3"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestRateLimitsRunBeforeHandlers(t *testing.T) {
	for _, endpoint := range []struct {
		path string
		max  int
	}{
		{"/api/v1/auth/customer/otp/send", 5},
		{"/api/v1/auth/customer/otp/verify", 10},
		{"/api/v1/auth/admin/otp/send", 5},
		{"/api/v1/auth/admin/otp/verify", 10},
		{"/api/v1/inquiries", 5},
	} {
		t.Run(endpoint.path, func(t *testing.T) {
			app := fiber.New()
			group := app.Group("/api/v1")
			RegisterAuthRoutes(group, nil)
			RegisterInquiryRoutes(group, nil)
			// Invalid payloads stop in validation, never touching the database or SMS provider.
			for i := 0; i <= endpoint.max; i++ {
				res, err := app.Test(httptest.NewRequest("POST", endpoint.path, nil))
				if err != nil {
					t.Fatal(err)
				}
				res.Body.Close()
				if i == endpoint.max && res.StatusCode != 429 {
					t.Fatalf("expected rate limit, got %d", res.StatusCode)
				}
				if i < endpoint.max && res.StatusCode == 429 {
					t.Fatal("limited too soon")
				}
			}
		})
	}
}

func TestInquiryListRequiresAuthentication(t *testing.T) {
	app := fiber.New()
	RegisterInquiryRoutes(app.Group("/api/v1"), nil)
	res, err := app.Test(httptest.NewRequest("GET", "/api/v1/inquiries", nil))
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 401 {
		t.Fatalf("expected 401, got %d", res.StatusCode)
	}
}

func TestUnsignedUploadsAreDenied(t *testing.T) {
	app := fiber.New()
	RegisterMediaRoutes(app, nil)
	res, err := app.Test(httptest.NewRequest("GET", "/uploads/shoes/test.webp", nil))
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 403 {
		t.Fatalf("expected 403, got %d", res.StatusCode)
	}
}

func TestSignedUploadServesFileAndRejectsTampering(t *testing.T) {
	if err := media.Configure("test-secret-at-least-thirty-two-bytes"); err != nil {
		t.Fatal(err)
	}
	// Use a temporary working directory, never the application's real uploads.
	old, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	if err := os.Chdir(root); err != nil {
		t.Fatal(err)
	}
	defer os.Chdir(old)
	if err := os.MkdirAll("uploads/shoes", 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join("uploads", "shoes", "test.webp"), []byte("media-test"), 0600); err != nil {
		t.Fatal(err)
	}
	app := fiber.New()
	RegisterMediaRoutes(app, nil)
	signed := media.SignURL("/uploads/shoes/test.webp", time.Now().Add(time.Minute).Unix(), "")
	res, err := app.Test(httptest.NewRequest("GET", signed, nil))
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != 200 {
		t.Fatalf("expected signed media 200, got %d", res.StatusCode)
	}
	parsed, _ := url.Parse(signed)
	query := parsed.Query()
	query.Set("g", "123")
	parsed.RawQuery = query.Encode()
	res, err = app.Test(httptest.NewRequest("GET", parsed.String(), nil))
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 403 {
		t.Fatalf("expected tampered media 403, got %d", res.StatusCode)
	}
}
