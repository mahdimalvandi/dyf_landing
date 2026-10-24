package category

import (
	"net/http"

	dtoCategory "dyf-backend/internal/dto/category"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Detail(categoryID int64) (dtoCategory.CategoryResponse, int, error) {
	categoryRecord, found, findError := service.repository.FindCategoryByID(categoryID)
	if findError != nil {
		return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoCategory.CategoryResponse{}, http.StatusNotFound, staticErrors.ErrCategoryNotFound
	}

	shoeCount, countError := service.repository.CountShoesForCategory(categoryID)
	if countError != nil {
		return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, countError
	}

	return dtoCategory.CategoryResponse{
		ID:        categoryRecord.ID,
		Title:     categoryRecord.Title,
		ShoeCount: shoeCount,
	}, http.StatusOK, nil
}
