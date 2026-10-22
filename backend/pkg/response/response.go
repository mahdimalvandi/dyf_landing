package response

import (
	"dyf-backend/pkg/apperror"

	"github.com/gofiber/fiber/v3"
	jsoniter "github.com/json-iterator/go"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

type Envelope struct {
	Success    bool        `json:"success"`
	StatusCode int         `json:"statusCode"`
	Message    string      `json:"message,omitempty"`
	Data       interface{} `json:"data,omitempty"`
	Meta       interface{} `json:"meta,omitempty"`
	Error      interface{} `json:"error,omitempty"`
}

type Meta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

type ErrorInfo struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

func Success(fiberContext fiber.Ctx, statusCode int, message string, data interface{}, meta interface{}) error {
	fiberContext.Status(statusCode)
	fiberContext.Set("Content-Type", "application/json; charset=utf-8")

	responseBytes, marshalError := json.Marshal(Envelope{
		Success:    true,
		StatusCode: statusCode,
		Message:    message,
		Data:       data,
		Meta:       meta,
	})
	if marshalError != nil {
		return fiberContext.Status(500).SendString(marshalError.Error())
	}

	return fiberContext.Send(responseBytes)
}

func Error(fiberContext fiber.Ctx, statusCode int, errorCode string, message string, details interface{}) error {
	fiberContext.Status(statusCode)
	fiberContext.Set("Content-Type", "application/json; charset=utf-8")

	responseBytes, marshalError := json.Marshal(Envelope{
		Success:    false,
		StatusCode: statusCode,
		Error: ErrorInfo{
			Code:    errorCode,
			Message: message,
			Details: details,
		},
	})
	if marshalError != nil {
		return fiberContext.Status(500).SendString(marshalError.Error())
	}

	return fiberContext.Send(responseBytes)
}

func FromAppError(fiberContext fiber.Ctx, err error, details interface{}) error {
	statusCode, errorCode, messageFa := apperror.Resolve(err)
	return Error(fiberContext, statusCode, errorCode, messageFa, details)
}
