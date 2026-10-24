package link

import (
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	constantsLink "dyf-backend/statics/constants/link"
)

func (service Service) Stats() (dtoLink.CatalogStatsResponse, int, error) {
	windowSeconds := int64(constantsLink.CatalogStatsDaysWindow * 24 * 60 * 60)
	windowStartTimestamp := time.Now().Unix() - windowSeconds

	last7DaysCount, countError := service.linkRepository.CountAccessedSince(windowStartTimestamp)
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
