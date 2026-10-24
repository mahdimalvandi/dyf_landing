package link

import (
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
)

func (service Service) Stats() (dtoLink.CatalogStatsResponse, int, error) {
	sevenDaysAgo := time.Now().Unix() - (7 * 24 * 60 * 60)

	last7DaysCount, countError := service.linkRepository.CountAccessedSince(sevenDaysAgo)
	if countError != nil {
		return dtoLink.CatalogStatsResponse{}, http.StatusInternalServerError, countError
	}

	totalAccessed, totalError := service.linkRepository.CountAllAccessed()
	if totalError != nil {
		return dtoLink.CatalogStatsResponse{}, http.StatusInternalServerError, totalError
	}

	return dtoLink.CatalogStatsResponse{
		Last7DaysViews:     last7DaysCount,
		TotalAccessedLinks: totalAccessed,
	}, http.StatusOK, nil
}
