package link

import (
	"net/http"
	"time"

	dtoAuth "dyf-backend/internal/dto/auth"
	dtoLink "dyf-backend/internal/dto/link"
	entityAuth "dyf-backend/internal/entity/auth"
	"dyf-backend/pkg/sms"
	constantsAuth "dyf-backend/statics/constants/auth"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) SendCatalogOTP(token string, request dtoLink.CatalogSendOTPRequest) (dtoAuth.SendOTPResponse, int, error) {
	linkRecord, found, findError := service.linkRepository.FindLinkByToken(token)
	if findError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoAuth.SendOTPResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}
	if !linkRecord.IsActive {
		return dtoAuth.SendOTPResponse{}, http.StatusForbidden, staticErrors.ErrLinkInactive
	}

	currentTimestamp := time.Now().Unix()
	if linkRecord.ExpiresAt > 0 && currentTimestamp > linkRecord.ExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoAuth.SendOTPResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}
	if linkRecord.ViewingExpiresAt > 0 && currentTimestamp > linkRecord.ViewingExpiresAt {
		if linkRecord.Status != constantsLink.StatusExpired {
			linkRecord.Status = constantsLink.StatusExpired
			_ = service.linkRepository.UpdateLink(linkRecord)
		}
		return dtoAuth.SendOTPResponse{}, http.StatusGone, staticErrors.ErrLinkExpired
	}

	latestOTP, otpFound, fetchError := service.authRepository.FindLatestActiveOTP(request.PhoneNumber, constantsAuth.PurposeCatalogLogin)
	if fetchError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, fetchError
	}

	if otpFound {
		elapsedSeconds := currentTimestamp - (latestOTP.ExpiresAt - int64(service.expirationSec))
		if elapsedSeconds < int64(service.cooldownSec) && currentTimestamp < latestOTP.ExpiresAt {
			return dtoAuth.SendOTPResponse{}, http.StatusTooManyRequests, staticErrors.ErrOTPCooldownActive
		}
	}

	nanosecondsThreshold := (currentTimestamp - constantsAuth.MaxRequestsWindowSec) * int64(time.Second)
	recentCount, countError := service.authRepository.CountRecentOTPRequests(request.PhoneNumber, constantsAuth.PurposeCatalogLogin, nanosecondsThreshold)
	if countError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, countError
	}
	if recentCount >= constantsAuth.MaxRequestsPerWindow {
		return dtoAuth.SendOTPResponse{}, http.StatusTooManyRequests, staticErrors.ErrTooManyRequests
	}

	isAuthorized := (linkRecord.PhoneNumber != "" && linkRecord.PhoneNumber == request.PhoneNumber)
	if !isAuthorized && linkRecord.CustomerID > 0 {
		customerRecord, customerFound, _ := service.customerRepository.FindCustomerByID(linkRecord.CustomerID)
		if customerFound && customerRecord.PhoneNumber == request.PhoneNumber && customerRecord.IsActive {
			isAuthorized = true
		}
	}

	if !isAuthorized {
		return dtoAuth.SendOTPResponse{
			ExpiresInSeconds: service.expirationSec,
		}, http.StatusOK, nil
	}

	generatedCode, codeError := generateNumericCode(constantsAuth.DefaultCodeLength)
	if codeError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, codeError
	}

	if invalidateError := service.authRepository.InvalidatePreviousOTPs(request.PhoneNumber, constantsAuth.PurposeCatalogLogin); invalidateError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, invalidateError
	}

	otpRecord := entityAuth.OTPVerification{
		ID:          time.Now().UnixNano(),
		PhoneNumber: request.PhoneNumber,
		Code:        generatedCode,
		Purpose:     constantsAuth.PurposeCatalogLogin,
		ExpiresAt:   currentTimestamp + int64(service.expirationSec),
		IsUsed:      false,
		Attempts:    0,
	}

	if createError := service.authRepository.CreateOTP(otpRecord); createError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, createError
	}

	deliveryPayload := sms.MessagePayload{
		Mobile:           request.PhoneNumber,
		Code:             generatedCode,
		TemplateID:       service.msgWayTemplate,
		ExpiresInSeconds: service.expirationSec,
	}

	if deliveryError := service.smsSender.SendOTP(deliveryPayload); deliveryError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusBadGateway, staticErrors.ErrSMSDeliveryFailed
	}

	return dtoAuth.SendOTPResponse{
		ExpiresInSeconds: service.expirationSec,
	}, http.StatusOK, nil
}
