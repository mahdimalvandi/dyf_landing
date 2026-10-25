package shoe

import (
	"net/http"

	dtoShoe "dyf-backend/internal/dto/shoe"
	entityShoe "dyf-backend/internal/entity/shoe"
)

func (service Service) List(filter dtoShoe.ListShoesFilter) (dtoShoe.ShoeListResponse, int, error) {
	shoesList, totalCount, listError := service.shoeRepository.ListShoes(filter.CategoryID, filter.Search, filter.Pagination)
	if listError != nil {
		return dtoShoe.ShoeListResponse{}, http.StatusInternalServerError, listError
	}

	filter.Pagination.Calculate(totalCount)

	preparedItems, prepareError := service.prepareShoeItems(shoesList)
	if prepareError != nil {
		return dtoShoe.ShoeListResponse{}, http.StatusInternalServerError, prepareError
	}

	return dtoShoe.ShoeListResponse{
		Items:      preparedItems,
		Pagination: filter.Pagination,
	}, http.StatusOK, nil
}

func (service Service) prepareShoeItems(shoesList []entityShoe.ShoeModel) ([]dtoShoe.ShoeItemResponse, error) {
	uniqueCategoryIDs := service.extractUniqueCategoryIDs(shoesList)
	categoryTitleMap, loadError := service.loadCategoryTitleMap(uniqueCategoryIDs)
	if loadError != nil {
		return nil, loadError
	}

	responseItems := make([]dtoShoe.ShoeItemResponse, 0, len(shoesList))
	for index := range shoesList {
		responseItems = append(responseItems, service.mapToShoeItemResponse(shoesList[index], categoryTitleMap))
	}

	return responseItems, nil
}

func (service Service) extractUniqueCategoryIDs(shoesList []entityShoe.ShoeModel) []int64 {
	uniqueCategoryMap := make(map[int64]bool)
	for index := range shoesList {
		for categoryIndex := range shoesList[index].CategoryIDs {
			uniqueCategoryMap[shoesList[index].CategoryIDs[categoryIndex]] = true
		}
	}

	uniqueCategoryIDs := make([]int64, 0, len(uniqueCategoryMap))
	for categoryID := range uniqueCategoryMap {
		uniqueCategoryIDs = append(uniqueCategoryIDs, categoryID)
	}
	return uniqueCategoryIDs
}

func (service Service) loadCategoryTitleMap(categoryIDs []int64) (map[int64]string, error) {
	categoryTitleMap := make(map[int64]string)
	if len(categoryIDs) == 0 {
		return categoryTitleMap, nil
	}

	categoriesList, findCategoriesError := service.categoryRepository.FindCategoriesByIDs(categoryIDs)
	if findCategoriesError != nil {
		return nil, findCategoriesError
	}

	for index := range categoriesList {
		categoryTitleMap[categoriesList[index].ID] = categoriesList[index].Title
	}

	return categoryTitleMap, nil
}

func (service Service) mapToShoeItemResponse(shoeRecord entityShoe.ShoeModel, categoryTitleMap map[int64]string) dtoShoe.ShoeItemResponse {
	categorySummaries := make([]dtoShoe.ShoeCategorySummary, 0, len(shoeRecord.CategoryIDs))
	for categoryIndex := range shoeRecord.CategoryIDs {
		targetCategoryID := shoeRecord.CategoryIDs[categoryIndex]
		if title, exists := categoryTitleMap[targetCategoryID]; exists {
			categorySummaries = append(categorySummaries, dtoShoe.ShoeCategorySummary{
				ID:    targetCategoryID,
				Title: title,
			})
		}
	}

	return dtoShoe.ShoeItemResponse{
		ID:          shoeRecord.ID,
		ModelID:     shoeRecord.ModelID,
		Title:       shoeRecord.ShoeTitle,
		Description: shoeRecord.Description,
		CoverImage:  shoeRecord.CoverImage,
		Categories:  categorySummaries,
		Colors:      shoeRecord.Colors,
		ColorsCount: len(shoeRecord.Colors),
		Sizes:       shoeRecord.Sizes,
		SizesCount:  len(shoeRecord.Sizes),
		Images:      shoeRecord.Images,
		Videos:      shoeRecord.Videos,
	}
}
