package category

import (
	"net/http"

	dtoCategory "dyf-backend/internal/dto/category"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Update(categoryID int64, request dtoCategory.UpdateCategoryRequest) (dtoCategory.CategoryResponse, int, error) {
	existingCategory, found, findError := service.repository.FindCategoryByID(categoryID)
	if findError != nil {
		return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoCategory.CategoryResponse{}, http.StatusNotFound, staticErrors.ErrCategoryNotFound
	}

	if existingCategory.Title != request.Title {
		categoryWithSameTitle, duplicateFound, checkError := service.repository.FindCategoryByTitle(request.Title)
		if checkError != nil {
			return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, checkError
		}
		if duplicateFound && categoryWithSameTitle.ID != categoryID {
			return dtoCategory.CategoryResponse{}, http.StatusConflict, staticErrors.ErrCategoryTitleDuplicate
		}
	}

	if updateError := service.repository.UpdateCategory(categoryID, request.Title); updateError != nil {
		return dtoCategory.CategoryResponse{}, http.StatusInternalServerError, updateError
	}

	return dtoCategory.CategoryResponse{
		ID:    categoryID,
		Title: request.Title,
	}, http.StatusOK, nil
}
