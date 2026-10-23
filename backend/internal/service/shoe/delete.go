package shoe

import (
	"net/http"

	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Delete(shoeID int64) (int, error) {
	_, found, findError := service.shoeRepository.FindShoeByID(shoeID)
	if findError != nil {
		return http.StatusInternalServerError, findError
	}
	if !found {
		return http.StatusNotFound, staticErrors.ErrShoeNotFound
	}

	if deleteError := service.shoeRepository.DeleteShoe(shoeID); deleteError != nil {
		return http.StatusInternalServerError, deleteError
	}

	return http.StatusOK, nil
}
