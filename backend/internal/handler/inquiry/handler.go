package inquiry

import (
	dtoInquiry "dyf-backend/internal/dto/inquiry"
	serviceInquiry "dyf-backend/internal/service/inquiry"
	"dyf-backend/pkg/request"
	"dyf-backend/pkg/response"
	"github.com/gofiber/fiber/v3"
)

type Handler struct{ service serviceInquiry.Service }

func NewHandler(service serviceInquiry.Service) Handler { return Handler{service: service} }
func (handler Handler) Create(fiberContext fiber.Ctx) error {
	var payload dtoInquiry.CreateRequest
	if parseError := request.ParseBody(fiberContext, &payload); parseError != nil {
		return nil
	}
	result, statusCode, createError := handler.service.Create(payload)
	if createError != nil {
		return response.FromError(fiberContext, statusCode, createError, nil)
	}
	return response.Success(fiberContext, statusCode, "درخواست همکاری شما با موفقیت ثبت شد", result, nil)
}
func (handler Handler) List(fiberContext fiber.Ctx) error {
	result, statusCode, listError := handler.service.List()
	if listError != nil {
		return response.FromError(fiberContext, statusCode, listError, nil)
	}
	return response.Success(fiberContext, statusCode, "درخواست‌های همکاری دریافت شدند", result, nil)
}
