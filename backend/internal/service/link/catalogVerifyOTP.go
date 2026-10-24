package link

import (
	"net/http"
	"time"

	dtoLink "dyf-backend/internal/dto/link"
	entityAuth "dyf-backend/internal/entity/auth"
	constantsAuth "dyf-backend/statics/constants/auth"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) VerifyCatalogOTP(token string, request dtoLink.CatalogVerifyOTPRequest) (dtoLink.CatalogVerifyOTPResponse, int, error) {
	linkRecord, found, findError := service.linkRepository.FindLinkByToken(token)
	if findError != nil {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}
	if !linkRecord.IsActive {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusForbidden, staticErrors.ErrLinkInactive
	}

	currentTimestamp := time.Now().Unix()
	if linkRecord.ExpiresAt > 0 && currentTimestamp > linkRecord.ExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}
	if linkRecord.ViewingExpiresAt > 0 && currentTimestamp > linkRecord.ViewingExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	isAuthorized := (linkRecord.PhoneNumber != "" && linkRecord.PhoneNumber == request.PhoneNumber)
	if !isAuthorized && linkRecord.CustomerID > 0 {
		customerRecord, customerFound, _ := service.customerRepository.FindCustomerByID(linkRecord.CustomerID)
		if customerFound && customerRecord.PhoneNumber == request.PhoneNumber && customerRecord.IsActive {
			isAuthorized = true
		}
	}
	if !isAuthorized {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}

	otpRecord, otpFound, fetchError := service.authRepository.FindLatestActiveOTP(request.PhoneNumber, constantsAuth.PurposeCatalogLogin)
	if fetchError != nil {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusInternalServerError, fetchError
	}
	if !otpFound {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}

	if currentTimestamp > otpRecord.ExpiresAt {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrOTPExpired
	}

	if otpRecord.Attempts >= constantsAuth.MaxVerifyAttempts {
		_ = service.authRepository.MarkOTPAsUsed(otpRecord.ID)
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusTooManyRequests, staticErrors.ErrTooManyRequests
	}

	if otpRecord.Code != request.Code {
		_ = service.authRepository.IncrementOTPAttempts(otpRecord.ID)
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}

	if markError := service.authRepository.MarkOTPAsUsed(otpRecord.ID); markError != nil {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusInternalServerError, markError
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
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusInternalServerError, updateError
	}

	rawToken, tokenHash, tokenError := generateSecureOpaqueToken()
	if tokenError != nil {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusInternalServerError, tokenError
	}

	sessionExpiresAt := currentTimestamp + int64(service.tokenExpirationHours*3600)
	if linkRecord.ViewingExpiresAt > 0 {
		sessionExpiresAt = linkRecord.ViewingExpiresAt
	} else if linkRecord.ExpiresAt > 0 && linkRecord.ExpiresAt < sessionExpiresAt {
		sessionExpiresAt = linkRecord.ExpiresAt
	}

	userID := linkRecord.ID
	if linkRecord.CustomerID > 0 {
		userID = linkRecord.CustomerID
	}

	deviceRecord := entityAuth.Device{
		ID:        time.Now().UnixNano(),
		UserID:    userID,
		UserType:  constantsAuth.UserTypeCatalog,
		TokenHash: tokenHash,
		ExpiresAt: sessionExpiresAt,
		Status:    constantsAuth.DeviceStatusActive,
	}

	if createDeviceError := service.authRepository.CreateDevice(deviceRecord); createDeviceError != nil {
		return dtoLink.CatalogVerifyOTPResponse{}, http.StatusInternalServerError, createDeviceError
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

	return dtoLink.CatalogVerifyOTPResponse{
		CatalogAccessResponse: dtoLink.CatalogAccessResponse{
			LinkID:           linkRecord.LinkID,
			RecipientName:    linkRecord.RecipientName,
			AuthMethod:       linkRecord.AuthMethod,
			Status:           linkRecord.Status,
			FirstViewedAt:    linkRecord.FirstViewedAt,
			ViewingExpiresAt: linkRecord.ViewingExpiresAt,
			LastAccessedAt:   linkRecord.LastAccessedAt,
			RemainingSeconds: remainingSeconds,
			ShoesCount:       len(linkRecord.ShoeIDs),
		},
		Token: rawToken,
	}, http.StatusOK, nil
}
