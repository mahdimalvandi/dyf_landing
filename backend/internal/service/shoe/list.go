package shoe

import (
	"math"
	"net/http"

	dtoShoe "dyf-backend/internal/dto/shoe"
)

func (service Service) List(filter dtoShoe.ListShoesFilter) ([]dtoShoe.ShoeListItemResponse, dtoShoe.PaginationMeta, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	shoesList, totalCount, listError := service.shoeRepository.ListShoes(filter.CategoryID, filter.Search, offset, filter.Limit)
	if listError != nil {
		return nil, dtoShoe.PaginationMeta{}, http.StatusInternalServerError, listError
	}

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

	categoryTitleMap := make(map[int64]string)
	if len(uniqueCategoryIDs) > 0 {
		categoriesList, findCategoriesError := service.categoryRepository.FindCategoriesByIDs(uniqueCategoryIDs)
		if findCategoriesError == nil {
			for index := range categoriesList {
				categoryTitleMap[categoriesList[index].ID] = categoriesList[index].Title
			}
		}
	}

	responseItems := make([]dtoShoe.ShoeListItemResponse, 0, len(shoesList))
	for index := range shoesList {
		singleShoe := shoesList[index]
		categorySummaries := make([]dtoShoe.ShoeCategorySummary, 0, len(singleShoe.CategoryIDs))
		for categoryIndex := range singleShoe.CategoryIDs {
			targetCategoryID := singleShoe.CategoryIDs[categoryIndex]
			if title, exists := categoryTitleMap[targetCategoryID]; exists {
				categorySummaries = append(categorySummaries, dtoShoe.ShoeCategorySummary{
					ID:    targetCategoryID,
					Title: title,
				})
			}
		}

		responseItems = append(responseItems, dtoShoe.ShoeListItemResponse{
			ID:          singleShoe.ID,
			ModelID:     singleShoe.ModelID,
			Title:       singleShoe.ShoeTitle,
			Description: singleShoe.Description,
			CoverImage:  singleShoe.CoverImage,
			Categories:  categorySummaries,
			Colors:      singleShoe.Colors,
			ColorsCount: len(singleShoe.Colors),
			Sizes:       singleShoe.Sizes,
			SizesCount:  len(singleShoe.Sizes),
			Images:      singleShoe.Images,
			Videos:      singleShoe.Videos,
		})
	}

	totalPages := 0
	if totalCount > 0 {
		totalPages = int(math.Ceil(float64(totalCount) / float64(filter.Limit)))
	}

	meta := dtoShoe.PaginationMeta{
		Page:       filter.Page,
		Limit:      filter.Limit,
		Total:      totalCount,
		TotalPages: totalPages,
	}

	return responseItems, meta, http.StatusOK, nil
}
