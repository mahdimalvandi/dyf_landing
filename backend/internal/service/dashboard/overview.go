package dashboard

import (
	"fmt"
	"net/http"
	"time"

	dtoDashboard "dyf-backend/internal/dto/dashboard"
	entityCustomer "dyf-backend/internal/entity/customer"
	entityLink "dyf-backend/internal/entity/link"
	constantsDashboard "dyf-backend/statics/constants/dashboard"
	constantsLink "dyf-backend/statics/constants/link"
)

func (service Service) Overview() (dtoDashboard.DashboardResponse, int, error) {
	currentTimestamp := time.Now().Unix()
	statsDaysSpanSeconds := int64(constantsDashboard.DashboardStatsDaysSpan * 24 * 60 * 60)
	statsWindowStart := currentTimestamp - statsDaysSpanSeconds

	activeShoesCount, shoesCountError := service.dashboardRepository.CountActiveShoes()
	if shoesCountError != nil {
		return dtoDashboard.DashboardResponse{}, http.StatusInternalServerError, shoesCountError
	}

	totalCustomersCount, customersCountError := service.dashboardRepository.CountTotalCustomers()
	if customersCountError != nil {
		return dtoDashboard.DashboardResponse{}, http.StatusInternalServerError, customersCountError
	}

	activeLinksCount, linksCountError := service.dashboardRepository.CountActiveValidLinks(currentTimestamp)
	if linksCountError != nil {
		return dtoDashboard.DashboardResponse{}, http.StatusInternalServerError, linksCountError
	}

	last7DaysViewsCount, viewsCountError := service.dashboardRepository.CountAccessedLinksSince(statsWindowStart)
	if viewsCountError != nil {
		return dtoDashboard.DashboardResponse{}, http.StatusInternalServerError, viewsCountError
	}

	recentLinksRaw, recentLinksError := service.dashboardRepository.FindRecentLinks(constantsDashboard.RecentLinksLimit)
	if recentLinksError != nil {
		return dtoDashboard.DashboardResponse{}, http.StatusInternalServerError, recentLinksError
	}

	recentCustomersRaw, recentCustomersError := service.dashboardRepository.FindRecentActiveCustomers(constantsDashboard.RecentCustomersLimit)
	if recentCustomersError != nil {
		return dtoDashboard.DashboardResponse{}, http.StatusInternalServerError, recentCustomersError
	}

	dashboardResponse := dtoDashboard.DashboardResponse{
		Stats: dtoDashboard.DashboardStats{
			ActiveShoesCount:    activeShoesCount,
			TotalCustomersCount: totalCustomersCount,
			ActiveLinksCount:    activeLinksCount,
			Last7DaysViewsCount: last7DaysViewsCount,
		},
		RecentLinks:     service.mapRecentLinks(recentLinksRaw),
		RecentCustomers: service.mapRecentCustomers(recentCustomersRaw),
	}
	dashboardResponse.EnsureNonNil()

	return dashboardResponse, http.StatusOK, nil
}

func (service Service) mapRecentLinks(rawLinks []entityLink.AccessLink) []dtoDashboard.RecentLinkItem {
	itemsList := make([]dtoDashboard.RecentLinkItem, 0, len(rawLinks))
	for index := range rawLinks {
		linkItem := rawLinks[index]
		publicCatalogURL := fmt.Sprintf("%s/%s", constantsLink.CatalogURLPrefix, linkItem.Token)

		itemsList = append(itemsList, dtoDashboard.RecentLinkItem{
			ID:                     linkItem.ID,
			LinkID:                 linkItem.LinkID,
			Token:                  linkItem.Token,
			URL:                    publicCatalogURL,
			RecipientName:          linkItem.RecipientName,
			PhoneNumber:            linkItem.PhoneNumber,
			ShoesCount:             len(linkItem.ShoeIDs),
			ViewingDurationMinutes: linkItem.ViewingDurationMinutes,
			ExpiresAt:              linkItem.ExpiresAt,
			FirstViewedAt:          linkItem.FirstViewedAt,
			ViewingExpiresAt:       linkItem.ViewingExpiresAt,
			LastAccessedAt:         linkItem.LastAccessedAt,
			IsActive:               linkItem.IsActive,
			Status:                 linkItem.Status,
		})
	}
	return itemsList
}

func (service Service) mapRecentCustomers(rawCustomers []entityCustomer.Customer) []dtoDashboard.RecentCustomerItem {
	itemsList := make([]dtoDashboard.RecentCustomerItem, 0, len(rawCustomers))
	for index := range rawCustomers {
		customerItem := rawCustomers[index]
		itemsList = append(itemsList, dtoDashboard.RecentCustomerItem{
			ID:          customerItem.ID,
			FirstNameFa: customerItem.FirstNameFa,
			LastNameFa:  customerItem.LastNameFa,
			FirstNameEn: customerItem.FirstNameEn,
			LastNameEn:  customerItem.LastNameEn,
			StoreName:   customerItem.StoreName,
			PhoneNumber: customerItem.PhoneNumber,
			IsActive:    customerItem.IsActive,
		})
	}
	return itemsList
}
