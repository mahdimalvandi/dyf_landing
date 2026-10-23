package shoe

import (
	"strconv"

	dtoShoe "dyf-backend/internal/dto/shoe"
	"dyf-backend/pkg/pagination"
	"dyf-backend/pkg/response"
	constantsShoe "dyf-backend/statics/constants/shoe"

	"github.com/gofiber/fiber/v3"
)

func (handler Handler) List(fiberContext fiber.Ctx) error {
	pageNumber, _ := strconv.Atoi(fiberContext.Query("page", "1"))
	limitNumber, _ := strconv.Atoi(fiberContext.Query("limit", "12"))
	categoryID, _ := strconv.ParseInt(fiberContext.Query("categoryID", "0"), 10, 64)
	searchTerm := fiberContext.Query("search", "")

	queryFilter := dtoShoe.ListShoesFilter{
		Pagination: pagination.Pagination{
			Page:  pageNumber,
			Limit: limitNumber,
		},
		CategoryID: categoryID,
		Search:     searchTerm,
	}
	queryFilter.Normalize()

	serviceResponse, statusCode, executeError := handler.service.List(queryFilter)
	if executeError != nil {
		return response.FromError(fiberContext, statusCode, executeError, nil)
	}

	return response.Success(fiberContext, statusCode, constantsShoe.MsgShoeListFetchedSuccessfully, serviceResponse, nil)
}
