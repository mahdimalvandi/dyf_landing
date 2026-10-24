package link

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
)

func TestExtractSessionToken_AuthorizationBearer(t *testing.T) {
	app := fiber.New()
	var extracted string

	app.Get("/test", func(c fiber.Ctx) error {
		extracted = extractSessionToken(c)
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer token-abc-123")
	_, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if extracted != "token-abc-123" {
		t.Fatalf("expected 'token-abc-123', got %q", extracted)
	}
}

func TestExtractSessionToken_CatalogHeader(t *testing.T) {
	app := fiber.New()
	var extracted string

	app.Get("/test", func(c fiber.Ctx) error {
		extracted = extractSessionToken(c)
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Catalog-Token", "catalog-header-val")
	_, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if extracted != "catalog-header-val" {
		t.Fatalf("expected 'catalog-header-val', got %q", extracted)
	}
}

func TestExtractSessionToken_SessionHeader(t *testing.T) {
	app := fiber.New()
	var extracted string

	app.Get("/test", func(c fiber.Ctx) error {
		extracted = extractSessionToken(c)
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Session-Token", "session-header-val")
	_, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if extracted != "session-header-val" {
		t.Fatalf("expected 'session-header-val', got %q", extracted)
	}
}

func TestExtractSessionToken_QueryParam(t *testing.T) {
	app := fiber.New()
	var extracted string

	app.Get("/test", func(c fiber.Ctx) error {
		extracted = extractSessionToken(c)
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test?sessionToken=query-token-val", nil)
	_, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if extracted != "query-token-val" {
		t.Fatalf("expected 'query-token-val', got %q", extracted)
	}
}

func TestExtractSessionToken_Empty(t *testing.T) {
	app := fiber.New()
	var extracted string

	app.Get("/test", func(c fiber.Ctx) error {
		extracted = extractSessionToken(c)
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	_, err := app.Test(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if extracted != "" {
		t.Fatalf("expected empty string, got %q", extracted)
	}
}
