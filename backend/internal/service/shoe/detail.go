package shoe

import (
	"net/http"

	dtoShoe "dyf-backend/internal/dto/shoe"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Detail(identifier int64) (dtoShoe.ShoeDetailResponse, int, error) {
	shoeRecord, found, findError := service.shoeRepository.FindShoeByIDOrModelID(identifier)
	if findError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoShoe.ShoeDetailResponse{}, http.StatusNotFound, staticErrors.ErrShoeNotFound
	}

	var categorySummaries []dtoShoe.ShoeCategorySummary
	if len(shoeRecord.CategoryIDs) > 0 {
		categoriesList, findCategoriesError := service.categoryRepository.FindCategoriesByIDs(shoeRecord.CategoryIDs)
		if findCategoriesError == nil {
			categorySummaries = make([]dtoShoe.ShoeCategorySummary, 0, len(categoriesList))
			for index := range categoriesList {
				categorySummaries = append(categorySummaries, dtoShoe.ShoeCategorySummary{
					ID:    categoriesList[index].ID,
					Title: categoriesList[index].Title,
				})
			}
		}
	}

	return dtoShoe.ShoeDetailResponse{
		ID:          shoeRecord.ID,
		ModelID:     shoeRecord.ModelID,
		Title:       shoeRecord.ShoeTitle,
		Description: shoeRecord.Description,
		CoverImage:  shoeRecord.CoverImage,
		Categories:  categorySummaries,
		CategoryIDs: shoeRecord.CategoryIDs,
		Colors:      shoeRecord.Colors,
		ColorsCount: len(shoeRecord.Colors),
		Sizes:       shoeRecord.Sizes,
		SizesCount:  len(shoeRecord.Sizes),
		Images:      shoeRecord.Images,
		Videos:      shoeRecord.Videos,
	}, http.StatusOK, nil
}
