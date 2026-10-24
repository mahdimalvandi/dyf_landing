package link

import (
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) CustomerShoes(fiberContext fiber.Ctx) error {
	sessionRawToken := extractSessionToken(fiberContext)
	serviceResponse, statusCode, executeError := handler.service.GetCustomerShoes(sessionRawToken)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgShoesFetchedSuccessfully, serviceResponse, nil)
}
