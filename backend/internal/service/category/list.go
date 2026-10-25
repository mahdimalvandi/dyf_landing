package category

import (
	"net/http"

	dtoCategory "dyf-backend/internal/dto/category"
)

func (service Service) List() ([]dtoCategory.CategoryResponse, int, error) {
	categoriesList, findError := service.repository.ListCategories()
	if findError != nil {
		return nil, http.StatusInternalServerError, findError
	}

	responseList := make([]dtoCategory.CategoryResponse, 0, len(categoriesList))
	for _, categoryRecord := range categoriesList {
		responseList = append(responseList, dtoCategory.CategoryResponse{
			ID:    categoryRecord.ID,
			Title: categoryRecord.Title,
		})
	}

	return responseList, http.StatusOK, nil
}
