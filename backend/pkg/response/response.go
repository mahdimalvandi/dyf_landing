package response

import (
	"github.com/gofiber/fiber/v2"
)

// Response defines the unified standard response envelope for all API endpoints
type Response struct {
	Success    bool        `json:"success"`
	StatusCode int         `json:"statusCode"`
	Message    string      `json:"message,omitempty"`
	Data       interface{} `json:"data,omitempty"`
	Meta       *Meta       `json:"meta,omitempty"`
	Error      *ErrorInfo  `json:"error,omitempty"`
}

// Meta holds pagination information
type Meta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

// ErrorInfo standardizes error structure
type ErrorInfo struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// Success sends a standardized JSON success response
func Success(c *fiber.Ctx, statusCode int, message string, data interface{}, meta *Meta) error {
	return c.Status(statusCode).JSON(Response{
		Success:    true,
		StatusCode: statusCode,
		Message:    message,
		Data:       data,
		Meta:       meta,
	})
}

// Error sends a standardized JSON error response
func Error(c *fiber.Ctx, statusCode int, errorCode, message string, details interface{}) error {
	return c.Status(statusCode).JSON(Response{
		Success:    false,
		StatusCode: statusCode,
		Error: &ErrorInfo{
			Code:    errorCode,
			Message: message,
			Details: details,
		},
	})
}
