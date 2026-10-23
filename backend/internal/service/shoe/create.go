package shoe

import (
	"net/http"
	"time"

	dtoShoe "dyf-backend/internal/dto/shoe"
	entityShoe "dyf-backend/internal/entity/shoe"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Create(request dtoShoe.CreateShoeRequest) (dtoShoe.ShoeDetailResponse, int, error) {
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

	shoeRecord := entityShoe.ShoeModel{
		ID:          time.Now().UnixNano(),
		ShoeTitle:   request.Title,
		Description: request.Description,
		CoverImage:  chosenCoverImage,
		Colors:      entityShoe.StringList(request.Colors),
		Sizes:       entityShoe.IntList(request.Sizes),
		Images:      entityShoe.StringList(finalImages),
		Videos:      entityShoe.StringList(request.Videos),
		CategoryIDs: entityShoe.Int64List(request.CategoryIDs),
	}

	createdRecord, createError := service.shoeRepository.CreateShoe(shoeRecord)
	if createError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, createError
	}

	var categorySummaries []dtoShoe.ShoeCategorySummary
	if len(request.CategoryIDs) > 0 {
		categoriesList, _ := service.categoryRepository.FindCategoriesByIDs(request.CategoryIDs)
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
			ID:          createdRecord.ID,
			ModelID:     createdRecord.ModelID,
			Title:       createdRecord.ShoeTitle,
			Description: createdRecord.Description,
			CoverImage:  createdRecord.CoverImage,
			Categories:  categorySummaries,
			Colors:      createdRecord.Colors,
			ColorsCount: len(createdRecord.Colors),
			Sizes:       createdRecord.Sizes,
			SizesCount:  len(createdRecord.Sizes),
			Images:      createdRecord.Images,
			Videos:      createdRecord.Videos,
		},
		CategoryIDs: createdRecord.CategoryIDs,
	}, http.StatusCreated, nil
}
