package shoe

import (
	"net/http"

	dtoShoe "dyf-backend/internal/dto/shoe"
	entityShoe "dyf-backend/internal/entity/shoe"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) RemoveMedia(shoeID int64, request dtoShoe.RemoveMediaRequest) (dtoShoe.ShoeDetailResponse, int, error) {
	existingShoe, found, findError := service.shoeRepository.FindShoeByID(shoeID)
	if findError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoShoe.ShoeDetailResponse{}, http.StatusNotFound, staticErrors.ErrShoeNotFound
	}

	mediaFound := false

	newImages := make([]string, 0, len(existingShoe.Images))
	for index := range existingShoe.Images {
		if existingShoe.Images[index] == request.MediaURL {
			mediaFound = true
		} else {
			newImages = append(newImages, existingShoe.Images[index])
		}
	}

	newVideos := make([]string, 0, len(existingShoe.Videos))
	for index := range existingShoe.Videos {
		if existingShoe.Videos[index] == request.MediaURL {
			mediaFound = true
		} else {
			newVideos = append(newVideos, existingShoe.Videos[index])
		}
	}

	if !mediaFound {
		return dtoShoe.ShoeDetailResponse{}, http.StatusNotFound, staticErrors.ErrMediaNotFound
	}

	existingShoe.Images = entityShoe.StringList(newImages)
	existingShoe.Videos = entityShoe.StringList(newVideos)

	if existingShoe.CoverImage == request.MediaURL {
		if len(existingShoe.Images) > 0 {
			existingShoe.CoverImage = existingShoe.Images[0]
		} else {
			existingShoe.CoverImage = ""
		}
	}

	if updateError := service.shoeRepository.UpdateShoe(existingShoe); updateError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, updateError
	}

	return service.Detail(existingShoe.ID)
}
