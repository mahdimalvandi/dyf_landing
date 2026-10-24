package link

import (
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Access(token string) (dtoLink.CatalogAccessResponse, int, error) {
	linkRecord, found, findError := service.linkRepository.FindLinkByToken(token)
	if findError != nil {
		return dtoLink.CatalogAccessResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoLink.CatalogAccessResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}

	if !linkRecord.IsActive {
		return dtoLink.CatalogAccessResponse{}, http.StatusForbidden, staticErrors.ErrLinkInactive
	}

	currentTimestamp := time.Now().Unix()

	if linkRecord.ExpiresAt > 0 && currentTimestamp > linkRecord.ExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogAccessResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	if linkRecord.ViewingExpiresAt > 0 && currentTimestamp > linkRecord.ViewingExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogAccessResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	if linkRecord.FirstViewedAt == 0 {
		linkRecord.FirstViewedAt = currentTimestamp
		linkRecord.Status = constantsLink.StatusActive
		if linkRecord.ViewingDurationMinutes > 0 {
			linkRecord.ViewingExpiresAt = currentTimestamp + int64(linkRecord.ViewingDurationMinutes*60)
		}
	}

	linkRecord.LastAccessedAt = currentTimestamp

	if updateError := service.linkRepository.UpdateLink(linkRecord); updateError != nil {
		return dtoLink.CatalogAccessResponse{}, http.StatusInternalServerError, updateError
	}

	var remainingSeconds int64
	if linkRecord.ViewingExpiresAt > 0 {
		remainingSeconds = linkRecord.ViewingExpiresAt - currentTimestamp
		if remainingSeconds < 0 {
			remainingSeconds = 0
		}
	} else if linkRecord.ExpiresAt > 0 {
		remainingSeconds = linkRecord.ExpiresAt - currentTimestamp
		if remainingSeconds < 0 {
			remainingSeconds = 0
		}
	}

	return dtoLink.CatalogAccessResponse{
		LinkID:           linkRecord.LinkID,
		RecipientName:    linkRecord.RecipientName,
		AuthMethod:       linkRecord.AuthMethod,
		Status:           linkRecord.Status,
		FirstViewedAt:    linkRecord.FirstViewedAt,
		ViewingExpiresAt: linkRecord.ViewingExpiresAt,
		LastAccessedAt:   linkRecord.LastAccessedAt,
		RemainingSeconds: remainingSeconds,
		ShoesCount:       len(linkRecord.ShoeIDs),
	}, http.StatusOK, nil
}
