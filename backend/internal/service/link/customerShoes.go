package link

import (
	"crypto/md5"
	"encoding/hex"
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	dtoShoe "dyf-backend/internal/dto/shoe"
	constantsAuth "dyf-backend/statics/constants/auth"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) GetCustomerShoes(sessionRawToken string) (dtoLink.CatalogShoesResponse, int, error) {
	if sessionRawToken == "" {
		return dtoLink.CatalogShoesResponse{}, http.StatusUnauthorized, staticErrors.ErrUnauthorized
	}

	currentTimestamp := time.Now().Unix()

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

	if deviceRecord.UserType != constantsAuth.UserTypeCustomer {
		return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrForbidden
	}

	customerRecord, customerFound, findCustomerError := service.customerRepository.FindCustomerByID(deviceRecord.UserID)
	if findCustomerError != nil || !customerFound || !customerRecord.IsActive {
		return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrCustomerInactive
	}

	activeLinks, linkListError := service.findActiveCustomerLinks(customerRecord.ID, customerRecord.PhoneNumber, currentTimestamp)
	if linkListError != nil {
		return dtoLink.CatalogShoesResponse{}, http.StatusInternalServerError, linkListError
	}
	if len(activeLinks) == 0 {
		return dtoLink.CatalogShoesResponse{}, http.StatusForbidden, staticErrors.ErrNoActivePermission
	}

	selectedLink := activeLinks[0]
	selectedLink.LastAccessedAt = currentTimestamp
	_ = service.linkRepository.UpdateLink(selectedLink)

	var shoeItems []dtoShoe.ShoeItemResponse
	if len(selectedLink.ShoeIDs) > 0 {
		shoesList, shoesError := service.shoeRepository.FindShoesByIDs(selectedLink.ShoeIDs)
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
	if selectedLink.ViewingExpiresAt > 0 {
		remainingSeconds = selectedLink.ViewingExpiresAt - currentTimestamp
		if remainingSeconds < 0 {
			remainingSeconds = 0
		}
	} else if selectedLink.ExpiresAt > 0 {
		remainingSeconds = selectedLink.ExpiresAt - currentTimestamp
		if remainingSeconds < 0 {
			remainingSeconds = 0
		}
	}

	return dtoLink.CatalogShoesResponse{
		LinkID:           selectedLink.LinkID,
		RecipientName:    selectedLink.RecipientName,
		Items:            shoeItems,
		RemainingSeconds: remainingSeconds,
	}, http.StatusOK, nil
}
