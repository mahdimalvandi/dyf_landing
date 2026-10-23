package link

import (
	"fmt"
	"net/http"

	dtoLink "dyf-backend/internal/dto/link"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Detail(identifier int64) (dtoLink.LinkDetailResponse, int, error) {
	linkRecord, found, findError := service.linkRepository.FindLinkByIDOrLinkID(identifier)
	if findError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoLink.LinkDetailResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}

	publicCatalogURL := fmt.Sprintf("%s/%s", constantsLink.CatalogURLPrefix, linkRecord.Token)

	return dtoLink.LinkDetailResponse{
		LinkItemResponse: dtoLink.LinkItemResponse{
			ID:                     linkRecord.ID,
			LinkID:                 linkRecord.LinkID,
			Token:                  linkRecord.Token,
			URL:                    publicCatalogURL,
			CustomerID:             linkRecord.CustomerID,
			RecipientName:          linkRecord.RecipientName,
			PhoneNumber:            linkRecord.PhoneNumber,
			AuthMethod:             linkRecord.AuthMethod,
			ShoesCount:             len(linkRecord.ShoeIDs),
			ViewingDurationMinutes: linkRecord.ViewingDurationMinutes,
			ExpiresAt:              linkRecord.ExpiresAt,
			FirstViewedAt:          linkRecord.FirstViewedAt,
			ViewingExpiresAt:       linkRecord.ViewingExpiresAt,
			IsActive:               linkRecord.IsActive,
			Status:                 linkRecord.Status,
		},
		ShoeIDs: linkRecord.ShoeIDs,
	}, http.StatusOK, nil
}
