package link

import (
	"net/http"
	"time"

	dtoCustomer "dyf-backend/internal/dto/customer"
	entityAuth "dyf-backend/internal/entity/auth"
	constantsAuth "dyf-backend/statics/constants/auth"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) VerifyCustomerOTP(request dtoCustomer.CustomerVerifyOTPRequest) (dtoCustomer.CustomerLoginResponse, int, error) {
	currentTimestamp := time.Now().Unix()

	otpRecord, otpFound, fetchError := service.authRepository.FindLatestActiveOTP(request.PhoneNumber, constantsAuth.PurposeCustomerLogin)
	if fetchError != nil {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusInternalServerError, fetchError
	}
	if !otpFound {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}

	if currentTimestamp > otpRecord.ExpiresAt {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusBadRequest, staticErrors.ErrOTPExpired
	}

	if otpRecord.Attempts >= constantsAuth.MaxVerifyAttempts {
		_ = service.authRepository.MarkOTPAsUsed(otpRecord.ID)
		return dtoCustomer.CustomerLoginResponse{}, http.StatusTooManyRequests, staticErrors.ErrTooManyRequests
	}

	if otpRecord.Code != request.Code {
		_ = service.authRepository.IncrementOTPAttempts(otpRecord.ID)
		return dtoCustomer.CustomerLoginResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}

	if markError := service.authRepository.MarkOTPAsUsed(otpRecord.ID); markError != nil {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusInternalServerError, markError
	}

	customerRecord, customerFound, findCustomerError := service.customerRepository.FindCustomerByPhone(request.PhoneNumber)
	if findCustomerError != nil {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusInternalServerError, findCustomerError
	}
	if !customerFound || !customerRecord.IsActive {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusForbidden, staticErrors.ErrCustomerInactive
	}

	activeLinks, linkListError := service.findActiveCustomerLinks(customerRecord.ID, customerRecord.PhoneNumber, currentTimestamp)
	if linkListError != nil {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusInternalServerError, linkListError
	}
	if len(activeLinks) == 0 {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusForbidden, staticErrors.ErrNoActivePermission
	}

	selectedLink := activeLinks[0]
	if selectedLink.FirstViewedAt == 0 {
		selectedLink.FirstViewedAt = currentTimestamp
		selectedLink.Status = constantsLink.StatusActive
		if selectedLink.ViewingDurationMinutes > 0 {
			selectedLink.ViewingExpiresAt = currentTimestamp + int64(selectedLink.ViewingDurationMinutes*60)
		}
	}
	selectedLink.LastAccessedAt = currentTimestamp
	_ = service.linkRepository.UpdateLink(selectedLink)

	rawToken, tokenHash, tokenError := generateSecureOpaqueToken()
	if tokenError != nil {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusInternalServerError, tokenError
	}

	sessionExpiresAt := currentTimestamp + int64(service.tokenExpirationHours*3600)
	if selectedLink.ViewingExpiresAt > 0 {
		sessionExpiresAt = selectedLink.ViewingExpiresAt
	} else if selectedLink.ExpiresAt > 0 && selectedLink.ExpiresAt < sessionExpiresAt {
		sessionExpiresAt = selectedLink.ExpiresAt
	}

	deviceRecord := entityAuth.Device{
		ID:        time.Now().UnixNano(),
		UserID:    customerRecord.ID,
		UserType:  constantsAuth.UserTypeCustomer,
		TokenHash: tokenHash,
		ExpiresAt: sessionExpiresAt,
		Status:    constantsAuth.DeviceStatusActive,
	}

	if createDeviceError := service.authRepository.CreateDevice(deviceRecord); createDeviceError != nil {
		return dtoCustomer.CustomerLoginResponse{}, http.StatusInternalServerError, createDeviceError
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

	return dtoCustomer.CustomerLoginResponse{
		Customer: dtoCustomer.CustomerResponse{
			ID:          customerRecord.ID,
			FirstNameFa: customerRecord.FirstNameFa,
			LastNameFa:  customerRecord.LastNameFa,
			FirstNameEn: customerRecord.FirstNameEn,
			LastNameEn:  customerRecord.LastNameEn,
			StoreName:   customerRecord.StoreName,
			PhoneNumber: customerRecord.PhoneNumber,
			IsActive:    customerRecord.IsActive,
		},
		Token:            rawToken,
		CatalogToken:     selectedLink.Token,
		LinkID:           selectedLink.LinkID,
		RemainingSeconds: remainingSeconds,
	}, http.StatusOK, nil
}
