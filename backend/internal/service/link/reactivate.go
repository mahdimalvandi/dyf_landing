package link

import (
	"net/http"

	dtoLink "dyf-backend/internal/dto/link"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Reactivate(linkID int64) (dtoLink.LinkDetailResponse, int, error) {
	existingLink, found, findError := service.linkRepository.FindLinkByID(linkID)
	if findError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoLink.LinkDetailResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}

	existingLink.IsActive = true
	existingLink.FirstViewedAt = 0
	existingLink.ViewingExpiresAt = 0
	existingLink.LastAccessedAt = 0
	existingLink.Status = constantsLink.StatusPending

	if saveError := service.linkRepository.UpdateLink(existingLink); saveError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, saveError
	}

	return service.Detail(existingLink.ID)
}
