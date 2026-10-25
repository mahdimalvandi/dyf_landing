package category

import (
	"net/http"

	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Delete(categoryID int64) (int, error) {
	_, found, findError := service.repository.FindCategoryByID(categoryID)
	if findError != nil {
		return http.StatusInternalServerError, findError
	}
	if !found {
		return http.StatusNotFound, staticErrors.ErrCategoryNotFound
	}

	if deleteError := service.repository.DeleteCategory(categoryID); deleteError != nil {
		return http.StatusInternalServerError, deleteError
	}

	return http.StatusOK, nil
}
