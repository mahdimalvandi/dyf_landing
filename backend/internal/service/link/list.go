package link

import (
	"fmt"
	"net/http"

	dtoLink "dyf-backend/internal/dto/link"
	entityLink "dyf-backend/internal/entity/link"
	constantsLink "dyf-backend/statics/constants/link"
)

func (service Service) List(filter dtoLink.ListLinksFilter) (dtoLink.LinkListResponse, int, error) {
	linksList, totalCount, listError := service.linkRepository.ListLinks(filter.Search, filter.Status, filter.CustomerID, filter.Pagination)
	if listError != nil {
		return dtoLink.LinkListResponse{}, http.StatusInternalServerError, listError
	}

	filter.Pagination.Calculate(totalCount)

	preparedItems := service.prepareLinkItems(linksList)

	return dtoLink.LinkListResponse{
		Items:      preparedItems,
		Pagination: filter.Pagination,
	}, http.StatusOK, nil
}

func (service Service) prepareLinkItems(linksList []entityLink.AccessLink) []dtoLink.LinkItemResponse {
	responseItems := make([]dtoLink.LinkItemResponse, 0, len(linksList))
	for index := range linksList {
		responseItems = append(responseItems, service.mapToLinkItemResponse(linksList[index]))
	}
	return responseItems
}

func (service Service) mapToLinkItemResponse(linkRecord entityLink.AccessLink) dtoLink.LinkItemResponse {
	publicCatalogURL := fmt.Sprintf("%s/%s", constantsLink.CatalogURLPrefix, linkRecord.Token)

	return dtoLink.LinkItemResponse{
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
	}
}
