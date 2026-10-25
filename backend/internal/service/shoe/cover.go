package shoe

import (
	"net/http"

	dtoShoe "dyf-backend/internal/dto/shoe"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) SetCover(shoeID int64, request dtoShoe.SetCoverRequest) (dtoShoe.ShoeDetailResponse, int, error) {
	existingShoe, found, findError := service.shoeRepository.FindShoeByID(shoeID)
	if findError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoShoe.ShoeDetailResponse{}, http.StatusNotFound, staticErrors.ErrShoeNotFound
	}

	existingShoe.CoverImage = request.CoverImage

	coverExistsInImages := false
	for index := range existingShoe.Images {
		if existingShoe.Images[index] == request.CoverImage {
			coverExistsInImages = true
			break
		}
	}
	if !coverExistsInImages {
		existingShoe.Images = append([]string{request.CoverImage}, existingShoe.Images...)
	}

	if updateError := service.shoeRepository.UpdateShoe(existingShoe); updateError != nil {
		return dtoShoe.ShoeDetailResponse{}, http.StatusInternalServerError, updateError
	}

	return service.Detail(existingShoe.ID)
}
