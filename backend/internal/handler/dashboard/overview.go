package dashboard

import (
	"dyf-backend/pkg/response"
	constantsDashboard "dyf-backend/statics/constants/dashboard"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) Overview(fiberContext fiber.Ctx) error {
	serviceResponse, statusCode, executeError := handler.service.Overview()
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsDashboard.MsgDashboardDataFetched, serviceResponse, nil)
}
