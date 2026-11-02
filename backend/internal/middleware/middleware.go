package middleware

import (
	"log"

	"dyf-backend/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func GlobalErrorHandler(fiberContext fiber.Ctx, uncaughtError error) error {
	if len(fiberContext.Response().Body()) > 0 {
		return nil
	}

	statusCode := fiber.StatusInternalServerError
	errorMessage := "خطای غیرمنتظره در سرور رخ داده است"
	errorCode := "INTERNAL_SERVER_ERROR"

	if fiberError, isFiberError := uncaughtError.(*fiber.Error); isFiberError {
		statusCode = fiberError.Code
		errorMessage = fiberError.Message
		if statusCode == fiber.StatusNotFound {
			errorCode = "NOT_FOUND"
		} else if statusCode == fiber.StatusBadRequest {
			errorCode = "BAD_REQUEST"
		}
	}

	// Paths and error text can contain catalog tokens or signed media credentials.
	log.Printf("[ERROR] method=%s status=%d type=%T", fiberContext.Method(), statusCode, uncaughtError)
	return response.Error(fiberContext, statusCode, errorCode, errorMessage, nil)
}
