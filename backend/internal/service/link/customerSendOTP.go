package link

import (
	"net/http"
	"time"

	dtoAuth "dyf-backend/internal/dto/auth"
	dtoCustomer "dyf-backend/internal/dto/customer"
	entityAuth "dyf-backend/internal/entity/auth"
	entityLink "dyf-backend/internal/entity/link"
	"dyf-backend/pkg/sms"
	constantsAuth "dyf-backend/statics/constants/auth"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) SendCustomerOTP(request dtoCustomer.CustomerSendOTPRequest) (dtoAuth.SendOTPResponse, int, error) {
	currentTimestamp := time.Now().Unix()

	latestOTP, otpFound, fetchError := service.authRepository.FindLatestActiveOTP(request.PhoneNumber, constantsAuth.PurposeCustomerLogin)
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
	recentCount, countError := service.authRepository.CountRecentOTPRequests(request.PhoneNumber, constantsAuth.PurposeCustomerLogin, nanosecondsThreshold)
	if countError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, countError
	}
	if recentCount >= constantsAuth.MaxRequestsPerWindow {
		return dtoAuth.SendOTPResponse{}, http.StatusTooManyRequests, staticErrors.ErrTooManyRequests
	}

	customerRecord, customerFound, findCustomerError := service.customerRepository.FindCustomerByPhone(request.PhoneNumber)
	if findCustomerError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, findCustomerError
	}

	hasActivePermission := false
	if customerFound && customerRecord.IsActive {
		activeLinks, linkListError := service.findActiveCustomerLinks(customerRecord.ID, customerRecord.PhoneNumber, currentTimestamp)
		if linkListError == nil && len(activeLinks) > 0 {
			hasActivePermission = true
		}
	}

	if !hasActivePermission {
		return dtoAuth.SendOTPResponse{
			ExpiresInSeconds: service.expirationSec,
		}, http.StatusOK, nil
	}

	generatedCode, codeError := generateNumericCode(constantsAuth.DefaultCodeLength)
	if codeError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, codeError
	}

	if invalidateError := service.authRepository.InvalidatePreviousOTPs(request.PhoneNumber, constantsAuth.PurposeCustomerLogin); invalidateError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, invalidateError
	}

	otpRecord := entityAuth.OTPVerification{
		ID:          time.Now().UnixNano(),
		PhoneNumber: request.PhoneNumber,
		Code:        generatedCode,
		Purpose:     constantsAuth.PurposeCustomerLogin,
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

func (service Service) findActiveCustomerLinks(customerID int64, phoneNumber string, currentTimestamp int64) ([]entityLink.AccessLink, error) {
	linksByCustomerID, errorByCustomerID := service.linkRepository.FindActiveLinksByCustomerID(customerID)
	if errorByCustomerID != nil {
		return nil, errorByCustomerID
	}
	linksByPhone, errorByPhone := service.linkRepository.FindActiveLinksByPhoneNumber(phoneNumber)
	if errorByPhone != nil {
		return nil, errorByPhone
	}

	mergedLinks := make([]entityLink.AccessLink, 0, len(linksByCustomerID)+len(linksByPhone))
	seenIDs := make(map[int64]bool)

	for index := range linksByCustomerID {
		targetLink := linksByCustomerID[index]
		if !seenIDs[targetLink.ID] && service.isLinkCurrentlyValid(targetLink, currentTimestamp) {
			seenIDs[targetLink.ID] = true
			mergedLinks = append(mergedLinks, targetLink)
		}
	}

	for index := range linksByPhone {
		targetLink := linksByPhone[index]
		if !seenIDs[targetLink.ID] && service.isLinkCurrentlyValid(targetLink, currentTimestamp) {
			seenIDs[targetLink.ID] = true
			mergedLinks = append(mergedLinks, targetLink)
		}
	}

	return mergedLinks, nil
}

func (service Service) isLinkCurrentlyValid(targetLink entityLink.AccessLink, currentTimestamp int64) bool {
	if !targetLink.IsActive {
		return false
	}
	if targetLink.ExpiresAt > 0 && currentTimestamp > targetLink.ExpiresAt {
		return false
	}
	if targetLink.ViewingExpiresAt > 0 && currentTimestamp > targetLink.ViewingExpiresAt {
		return false
	}
	return true
}
