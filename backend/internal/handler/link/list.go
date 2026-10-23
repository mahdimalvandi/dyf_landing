package link

import (
	"strconv"

	dtoLink "dyf-backend/internal/dto/link"
	"dyf-backend/pkg/pagination"
	"dyf-backend/pkg/response"
	constantsLink "dyf-backend/statics/constants/link"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) List(fiberContext fiber.Ctx) error {
	pageNumber, _ := strconv.Atoi(fiberContext.Query("page", "1"))
	limitNumber, _ := strconv.Atoi(fiberContext.Query("limit", "12"))
	searchTerm := fiberContext.Query("search", "")
	statusFilter := fiberContext.Query("status", "")
	customerID, _ := strconv.ParseInt(fiberContext.Query("customerID", "0"), 10, 64)

	queryFilter := dtoLink.ListLinksFilter{
		Pagination: pagination.Pagination{
			Page:  pageNumber,
			Limit: limitNumber,
		},
		Search:     searchTerm,
		Status:     statusFilter,
		CustomerID: customerID,
	}
	queryFilter.Normalize()

	serviceResponse, statusCode, executeError := handler.service.List(queryFilter)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsLink.MsgLinkListFetchedSuccessfully, serviceResponse, nil)
}
