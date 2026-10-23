package customer

import (
	"strconv"

	dtoCustomer "dyf-backend/internal/dto/customer"
	"dyf-backend/pkg/pagination"
	"dyf-backend/pkg/response"
	constantsCustomer "dyf-backend/statics/constants/customer"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) List(fiberContext fiber.Ctx) error {
	pageNumber, _ := strconv.Atoi(fiberContext.Query("page", "1"))
	limitNumber, _ := strconv.Atoi(fiberContext.Query("limit", "12"))
	searchTerm := fiberContext.Query("search", "")
	statusFilter := fiberContext.Query("status", "")

	queryFilter := dtoCustomer.ListCustomersFilter{
		Pagination: pagination.Pagination{
			Page:  pageNumber,
			Limit: limitNumber,
		},
		Search: searchTerm,
		Status: statusFilter,
	}
	queryFilter.Normalize()

	serviceResponse, statusCode, executeError := handler.service.List(queryFilter)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsCustomer.MsgCustomerListFetchedSuccessfully, serviceResponse, nil)
}
