package category

import (
	"net/http"
	"time"

	dtoCategory "dyf-backend/internal/dto/category"
	entityCategory "dyf-backend/internal/entity/category"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Create(request dtoCategory.CreateCategoryRequest) (dtoCategory.CategoryResponse, int, error) {
	_, found, findError := service.repository.FindCategoryByTitle(request.Title)
	if findError != nil {
		return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, findError
	}
	if found {
		return dtoCategory.CategoryResponse{}, http.StatusConflict, staticErrors.ErrCategoryTitleDuplicate
	}

	categoryRecord := entityCategory.Category{
		ID:    time.Now().UnixNano(),
		Title: request.Title,
	}

	if createError := service.repository.CreateCategory(categoryRecord); createError != nil {
		return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, createError
	}

	return dtoCategory.CategoryResponse{
		ID:    categoryRecord.ID,
		Title: categoryRecord.Title,
	}, http.StatusCreated, nil
}
