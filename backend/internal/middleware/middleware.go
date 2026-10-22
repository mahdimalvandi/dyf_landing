package middleware

import (
	"log"

	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v2"
)

// GlobalErrorHandler catches unhandled errors and panics to return unified standard JSON
func GlobalErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "خطای غیرمنتظره در سرور رخ داده است"
	errorCode := "INTERNAL_SERVER_ERROR"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
		if code == fiber.StatusNotFound {
			errorCode = "NOT_FOUND"
		} else if code == fiber.StatusBadRequest {
			errorCode = "BAD_REQUEST"
		}
	}

	log.Printf("[ERROR] %s %s - %v", c.Method(), c.Path(), err)
	return response.Error(c, code, errorCode, message, nil)
}
