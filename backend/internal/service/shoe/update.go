package shoe

import (
	"net/http"

	dtoShoe "dyf-backend/internal/dto/shoe"
	entityShoe "dyf-backend/internal/entity/shoe"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Update(shoeID int64, request dtoShoe.UpdateShoeRequest) (dtoShoe.ShoeDetailResponse, int, error) {
	existingShoe, found, findError := service.shoeRepository.FindShoeByID(shoeID)
	if findError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoShoe.ShoeDetailResponse{}, http.StatusNotFound, staticErrors.ErrShoeNotFound
	}

	if len(request.CategoryIDs) > 0 {
		foundCategories, findCategoriesError := service.categoryRepository.FindCategoriesByIDs(request.CategoryIDs)
		if findCategoriesError != nil {
			return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, findCategoriesError
		}
		if len(foundCategories) != len(request.CategoryIDs) {
			return dtoShoe.ShoeDetailResponse{}, http.StatusBadRequest, staticErrors.ErrCategoryNotFoundForShoe
		}
	}

	chosenCoverImage := request.CoverImage
	if chosenCoverImage == "" && len(request.Images) > 0 {
		chosenCoverImage = request.Images[0]
	}

	finalImages := request.Images
	if chosenCoverImage != "" {
		coverExistsInImages := false
		for index := range finalImages {
			if finalImages[index] == chosenCoverImage {
				coverExistsInImages = true
				break
			}
		}
		if !coverExistsInImages {
			finalImages = append([]string{chosenCoverImage}, finalImages...)
		}
	}

	existingShoe.ShoeTitle = request.Title
	existingShoe.Description = request.Description
	existingShoe.CoverImage = chosenCoverImage
	existingShoe.Colors = entityShoe.StringList(request.Colors)
	existingShoe.Sizes = entityShoe.IntList(request.Sizes)
	existingShoe.Images = entityShoe.StringList(finalImages)
	existingShoe.Videos = entityShoe.StringList(request.Videos)
	existingShoe.CategoryIDs = entityShoe.Int64List(request.CategoryIDs)

	if updateError := service.shoeRepository.UpdateShoe(existingShoe); updateError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, updateError
	}

	var categorySummaries []dtoShoe.ShoeCategorySummary
	if len(existingShoe.CategoryIDs) > 0 {
		categoriesList, _ := service.categoryRepository.FindCategoriesByIDs(existingShoe.CategoryIDs)
		categorySummaries = make([]dtoShoe.ShoeCategorySummary, 0, len(categoriesList))
		for index := range categoriesList {
			categorySummaries = append(categorySummaries, dtoShoe.ShoeCategorySummary{
				ID:    categoriesList[index].ID,
				Title: categoriesList[index].Title,
			})
		}
	}

	return dtoShoe.ShoeDetailResponse{
		ShoeItemResponse: dtoShoe.ShoeItemResponse{
			ID:          existingShoe.ID,
			ModelID:     existingShoe.ModelID,
			Title:       existingShoe.ShoeTitle,
			Description: existingShoe.Description,
			CoverImage:  existingShoe.CoverImage,
			Categories:  categorySummaries,
			Colors:      existingShoe.Colors,
			ColorsCount: len(existingShoe.Colors),
			Sizes:       existingShoe.Sizes,
			SizesCount:  len(existingShoe.Sizes),
			Images:      existingShoe.Images,
			Videos:      existingShoe.Videos,
		},
		CategoryIDs: existingShoe.CategoryIDs,
	}, http.StatusOK, nil
}
