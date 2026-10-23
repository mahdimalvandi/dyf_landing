package link

import (
	"net/http"

	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Delete(linkID int64) (int, error) {
	_, found, findError := service.linkRepository.FindLinkByID(linkID)
	if findError != nil {
		return http.StatusInternalServerError, findError
	}
	if !found {
		return http.StatusNotFound, staticErrors.ErrLinkNotFound
	}

	if deleteError := service.linkRepository.DeleteLink(linkID); deleteError != nil {
		return http.StatusInternalServerError, deleteError
	}

	return http.StatusOK, nil
}
