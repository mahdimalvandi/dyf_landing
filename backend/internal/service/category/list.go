package category

import (
	"net/http"

	dtoCategory "dyf-backend/internal/dto/category"
)

func (service Service) List() ([]dtoCategory.CategoryResponse, int, error) {
	categoriesList, findError := service.repository.ListCategoriesWithShoeCount()
	if findError != nil {
		return nil, http.StatusInternalServerError, findError
	}

	responseList := make([]dtoCategory.CategoryResponse, 0, len(categoriesList))
	for index := range categoriesList {
		categoryRecord := categoriesList[index]
		responseList = append(responseList, dtoCategory.CategoryResponse{
			ID:        categoryRecord.ID,
			Title:     categoryRecord.Title,
			ShoeCount: categoryRecord.ShoeCount,
		})
	}

	return responseList, http.StatusOK, nil
}
