package link

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	entityLink "dyf-backend/internal/entity/link"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Create(request dtoLink.CreateLinkRequest) (dtoLink.LinkDetailResponse, int, error) {
	if len(request.ShoeIDs) == 0 {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrNoShoesSelectedForLink
	}

	if request.AuthMethod != constantsLink.AuthMethodDirect && request.AuthMethod != constantsLink.AuthMethodOTP {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidAuthMethod
	}

	if request.AuthMethod == constantsLink.AuthMethodOTP && request.PhoneNumber == "" {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrValidationFailed
	}

	if request.CustomerID > 0 {
		_, customerFound, findCustomerError := service.customerRepository.FindCustomerByID(request.CustomerID)
		if findCustomerError != nil {
			return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, findCustomerError
		}
		if !customerFound {
			return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrCustomerNotFound
		}
	}

	tokenBytes := make([]byte, 32)
	if _, readRandomError := rand.Read(tokenBytes); readRandomError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, staticErrors.ErrInternalServerError
	}
	generatedToken := hex.EncodeToString(tokenBytes)

	linkRecord := entityLink.AccessLink{
		ID:                     time.Now().UnixNano(),
		Token:                  generatedToken,
		CustomerID:             request.CustomerID,
		RecipientName:          request.RecipientName,
		PhoneNumber:            request.PhoneNumber,
		AuthMethod:             request.AuthMethod,
		ShoeIDs:                entityLink.Int64List(request.ShoeIDs),
		ViewingDurationMinutes: request.ViewingDurationMinutes,
		ExpiresAt:              request.ExpiresAt,
		FirstViewedAt:          0,
		ViewingExpiresAt:       0,
		IsActive:               true,
		Status:                 constantsLink.StatusPending,
	}

	createdRecord, createError := service.linkRepository.CreateLink(linkRecord)
	if createError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, createError
	}

	publicCatalogURL := fmt.Sprintf("%s/%s", constantsLink.CatalogURLPrefix, createdRecord.Token)

	return dtoLink.LinkDetailResponse{
		LinkItemResponse: dtoLink.LinkItemResponse{
			ID:                     createdRecord.ID,
			LinkID:                 createdRecord.LinkID,
			Token:                  createdRecord.Token,
			URL:                    publicCatalogURL,
			CustomerID:             createdRecord.CustomerID,
			RecipientName:          createdRecord.RecipientName,
			PhoneNumber:            createdRecord.PhoneNumber,
			AuthMethod:             createdRecord.AuthMethod,
			ShoesCount:             len(createdRecord.ShoeIDs),
			ViewingDurationMinutes: createdRecord.ViewingDurationMinutes,
			ExpiresAt:              createdRecord.ExpiresAt,
			FirstViewedAt:          createdRecord.FirstViewedAt,
			ViewingExpiresAt:       createdRecord.ViewingExpiresAt,
			IsActive:               createdRecord.IsActive,
			Status:                 createdRecord.Status,
		},
		ShoeIDs: createdRecord.ShoeIDs,
	}, http.StatusCreated, nil
}
