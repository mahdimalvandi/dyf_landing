package link

import (
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	dtoShoe "dyf-backend/internal/dto/shoe"
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
	if linkRecord.AuthMethod != constantsLink.AuthMethodDirect {
		return dtoLink.CatalogAccessResponse{}, http.StatusForbidden, staticErrors.ErrInvalidAuthMethod
	}

	currentTimestamp := time.Now().Unix()

	if linkRecord.ExpiresAt > 0 && currentTimestamp >= linkRecord.ExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogAccessResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	if linkRecord.ViewingExpiresAt > 0 && currentTimestamp >= linkRecord.ViewingExpiresAt {
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
	if linkRecord.ExpiresAt > 0 && (remainingSeconds == 0 || linkRecord.ExpiresAt-currentTimestamp < remainingSeconds) {
		remainingSeconds = linkRecord.ExpiresAt - currentTimestamp
	}

	shoes := make([]dtoShoe.ShoeItemResponse, 0, len(linkRecord.ShoeIDs))
	for _, identifier := range linkRecord.ShoeIDs {
		_, found, findError := service.shoeRepository.FindShoeByID(identifier)
		if findError != nil {
			return dtoLink.CatalogAccessResponse{}, http.StatusInternalServerError, findError
		}
		if !found {
			continue
		}
		shoe, statusCode, detailError := service.shoeService.Detail(identifier)
		if detailError != nil {
			if statusCode == http.StatusNotFound {
				continue
			}
			return dtoLink.CatalogAccessResponse{}, statusCode, detailError
		}
		shoes = append(shoes, shoe.ShoeItemResponse)
	}
	return dtoLink.CatalogAccessResponse{
		Shoes:            shoes,
		LinkID:           linkRecord.LinkID,
		RecipientName:    linkRecord.RecipientName,
		AuthMethod:       linkRecord.AuthMethod,
		Status:           linkRecord.Status,
		FirstViewedAt:    linkRecord.FirstViewedAt,
		ViewingExpiresAt: linkRecord.ViewingExpiresAt,
		LastAccessedAt:   linkRecord.LastAccessedAt,
		RemainingSeconds: remainingSeconds,
		ShoesCount:       len(shoes),
	}, http.StatusOK, nil
}
