package link

import (
	"crypto/md5"
	"encoding/hex"
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	dtoShoe "dyf-backend/internal/dto/shoe"
	entityShoe "dyf-backend/internal/entity/shoe"
	constantsAuth "dyf-backend/statics/constants/auth"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) GetCatalogShoes(token string, sessionRawToken string) (dtoLink.CatalogShoesResponse, int, error) {
	linkRecord, found, findError := service.linkRepository.FindLinkByToken(token)
	if findError != nil {
		return dtoLink.CatalogShoesResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoLink.CatalogShoesResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}

	if !linkRecord.IsActive {
		return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrLinkInactive
	}

	currentTimestamp := time.Now().Unix()

	if linkRecord.ExpiresAt > 0 && currentTimestamp > linkRecord.ExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogShoesResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	if linkRecord.ViewingExpiresAt > 0 && currentTimestamp > linkRecord.ViewingExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogShoesResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	if linkRecord.AuthMethod == constantsLink.AuthMethodOTP {
		if sessionRawToken == "" {
			return dtoLink.CatalogShoesResponse{}, http.StatusUnauthorized, staticErrors.ErrUnauthorized
		}

		md5Hasher := md5.New()
		md5Hasher.Write([]byte(sessionRawToken))
		tokenHash := hex.EncodeToString(md5Hasher.Sum(nil))

		deviceRecord, deviceFound, deviceError := service.authRepository.FindDeviceByTokenHash(tokenHash)
		if deviceError != nil || !deviceFound {
			return dtoLink.CatalogShoesResponse{}, http.StatusUnauthorized, staticErrors.ErrUnauthorized
		}

		if deviceRecord.Status != constantsAuth.DeviceStatusActive {
			return dtoLink.CatalogShoesResponse{}, http.StatusUnauthorized, staticErrors.ErrUnauthorized
		}

		if currentTimestamp > deviceRecord.ExpiresAt {
			_ = service.authRepository.UpdateDeviceStatus(deviceRecord.ID, constantsAuth.DeviceStatusExpired)
			return dtoLink.CatalogShoesResponse{}, http.StatusUnauthorized, staticErrors.ErrUnauthorized
		}

		if deviceRecord.UserType != constantsAuth.UserTypeCatalog && deviceRecord.UserType != constantsAuth.UserTypeCustomer {
			return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrForbidden
		}

		if deviceRecord.UserType == constantsAuth.UserTypeCatalog {
			isMatch := (deviceRecord.UserID == linkRecord.ID)
			if !isMatch && linkRecord.CustomerID > 0 && deviceRecord.UserID == linkRecord.CustomerID {
				isMatch = true
			}
			if !isMatch {
				return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrForbidden
			}
		} else if deviceRecord.UserType == constantsAuth.UserTypeCustomer {
			isMatch := (linkRecord.CustomerID > 0 && deviceRecord.UserID == linkRecord.CustomerID)
			if !isMatch && linkRecord.CustomerID == 0 && linkRecord.PhoneNumber != "" {
				customerRecord, customerFound, _ := service.customerRepository.FindCustomerByID(deviceRecord.UserID)
				if customerFound && customerRecord.PhoneNumber == linkRecord.PhoneNumber {
					isMatch = true
				}
			}
			if !isMatch {
				return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrForbidden
			}
		}
	} else if linkRecord.AuthMethod == constantsLink.AuthMethodDirect {
		if linkRecord.FirstViewedAt == 0 {
			linkRecord.FirstViewedAt = currentTimestamp
			linkRecord.Status = constantsLink.StatusActive
			if linkRecord.ViewingDurationMinutes > 0 {
				linkRecord.ViewingExpiresAt = currentTimestamp + int64(linkRecord.ViewingDurationMinutes*60)
			}
		}
		linkRecord.LastAccessedAt = currentTimestamp
		_ = service.linkRepository.UpdateLink(linkRecord)
	}

	var shoeItems []dtoShoe.ShoeItemResponse
	if len(linkRecord.ShoeIDs) > 0 {
		shoesList, shoesError := service.shoeRepository.FindShoesByIDs(linkRecord.ShoeIDs)
		if shoesError != nil {
			return dtoLink.CatalogShoesResponse{}, http.StatusInternalServerError, shoesError
		}

		preparedItems, prepError := service.prepareShoeItems(shoesList)
		if prepError != nil {
			return dtoLink.CatalogShoesResponse{}, http.StatusInternalServerError, prepError
		}
		shoeItems = preparedItems
	} else {
		shoeItems = make([]dtoShoe.ShoeItemResponse, 0)
	}

	var remainingSeconds int64
	if linkRecord.ViewingExpiresAt > 0 {
		remainingSeconds = linkRecord.ViewingExpiresAt - currentTimestamp
		if remainingSeconds < 0 {
			remainingSeconds = 0
		}
	} else if linkRecord.FirstViewedAt == 0 && linkRecord.ViewingDurationMinutes > 0 {
		remainingSeconds = int64(linkRecord.ViewingDurationMinutes * 60)
	} else if linkRecord.ExpiresAt > 0 {
		remainingSeconds = linkRecord.ExpiresAt - currentTimestamp
		if remainingSeconds < 0 {
			remainingSeconds = 0
		}
	}

	return dtoLink.CatalogShoesResponse{
		LinkID:           linkRecord.LinkID,
		RecipientName:    linkRecord.RecipientName,
		Items:            shoeItems,
		RemainingSeconds: remainingSeconds,
	}, http.StatusOK, nil
}

func (service Service) prepareShoeItems(shoesList []entityShoe.ShoeModel) ([]dtoShoe.ShoeItemResponse, error) {
	uniqueCategoryIDs := service.extractUniqueCategoryIDs(shoesList)
	categoryTitleMap, loadError := service.loadCategoryTitleMap(uniqueCategoryIDs)
	if loadError != nil {
		return nil, loadError
	}

	responseItems := make([]dtoShoe.ShoeItemResponse, 0, len(shoesList))
	for index := range shoesList {
		responseItems = append(responseItems, service.mapToShoeItemResponse(shoesList[index], categoryTitleMap))
	}

	return responseItems, nil
}

func (service Service) extractUniqueCategoryIDs(shoesList []entityShoe.ShoeModel) []int64 {
	uniqueCategoryMap := make(map[int64]bool)
	for index := range shoesList {
		for categoryIndex := range shoesList[index].CategoryIDs {
			uniqueCategoryMap[shoesList[index].CategoryIDs[categoryIndex]] = true
		}
	}

	uniqueCategoryIDs := make([]int64, 0, len(uniqueCategoryMap))
	for categoryID := range uniqueCategoryMap {
		uniqueCategoryIDs = append(uniqueCategoryIDs, categoryID)
	}
	return uniqueCategoryIDs
}

func (service Service) loadCategoryTitleMap(categoryIDs []int64) (map[int64]string, error) {
	categoryTitleMap := make(map[int64]string)
	if len(categoryIDs) == 0 {
		return categoryTitleMap, nil
	}

	categoriesList, findCategoriesError := service.categoryRepository.FindCategoriesByIDs(categoryIDs)
	if findCategoriesError != nil {
		return nil, findCategoriesError
	}

	for index := range categoriesList {
		categoryTitleMap[categoriesList[index].ID] = categoriesList[index].Title
	}

	return categoryTitleMap, nil
}

func (service Service) mapToShoeItemResponse(shoeRecord entityShoe.ShoeModel, categoryTitleMap map[int64]string) dtoShoe.ShoeItemResponse {
	categorySummaries := make([]dtoShoe.ShoeCategorySummary, 0, len(shoeRecord.CategoryIDs))
	for categoryIndex := range shoeRecord.CategoryIDs {
		targetCategoryID := shoeRecord.CategoryIDs[categoryIndex]
		if title, exists := categoryTitleMap[targetCategoryID]; exists {
			categorySummaries = append(categorySummaries, dtoShoe.ShoeCategorySummary{
				ID:    targetCategoryID,
				Title: title,
			})
		}
	}

	return dtoShoe.ShoeItemResponse{
		ID:          shoeRecord.ID,
		ModelID:     shoeRecord.ModelID,
		Title:       shoeRecord.ShoeTitle,
		Description: shoeRecord.Description,
		CoverImage:  shoeRecord.CoverImage,
		Categories:  categorySummaries,
		Colors:      shoeRecord.Colors,
		ColorsCount: len(shoeRecord.Colors),
		Sizes:       shoeRecord.Sizes,
		SizesCount:  len(shoeRecord.Sizes),
		Images:      shoeRecord.Images,
		Videos:      shoeRecord.Videos,
	}
}
