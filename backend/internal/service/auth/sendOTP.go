package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"

	dtoAuth "dyf-backend/internal/dto/auth"
	entityAuth "dyf-backend/internal/entity/auth"
	"dyf-backend/pkg/sms"
	constantsAuth "dyf-backend/statics/constants/auth"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) SendOTP(request dtoAuth.SendOTPRequest) (dtoAuth.SendOTPResponse, int, error) {
	adminUser, found, findError := service.repository.FindAdminByPhoneNumber(request.PhoneNumber)
	if findError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoAuth.SendOTPResponse{}, http.StatusNotFound, staticErrors.ErrUserNotFound
	}
	if !adminUser.IsActive {
		return dtoAuth.SendOTPResponse{}, http.StatusForbidden, staticErrors.ErrAdminInactive
	}
	return service.sendOTP(request.PhoneNumber, constantsAuth.PurposeAdminLogin)
}

func (service Service) sendOTP(phoneNumber, purpose string) (dtoAuth.SendOTPResponse, int, error) {

	currentTime := time.Now().Unix()

	latestOTP, otpFound, fetchError := service.repository.FindLatestActiveOTP(phoneNumber, purpose)
	if fetchError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, fetchError
	}

	if otpFound {
		elapsedSeconds := currentTime - (latestOTP.ExpiresAt - int64(service.expirationSec))
		if elapsedSeconds < int64(service.cooldownSec) && currentTime < latestOTP.ExpiresAt {
			return dtoAuth.SendOTPResponse{}, http.StatusTooManyRequests, staticErrors.ErrOTPCooldownActive
		}
	}

	nanosecondsThreshold := (currentTime - constantsAuth.MaxRequestsWindowSec) * int64(time.Second)
	recentCount, countError := service.repository.CountRecentOTPRequests(phoneNumber, purpose, nanosecondsThreshold)
	if countError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, countError
	}
	if recentCount >= constantsAuth.MaxRequestsPerWindow {
		return dtoAuth.SendOTPResponse{}, http.StatusTooManyRequests, staticErrors.ErrTooManyRequests
	}

	generatedCode, codeError := generateNumericCode(constantsAuth.DefaultCodeLength)
	if codeError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, codeError
	}

	if invalidateError := service.repository.InvalidatePreviousOTPs(phoneNumber, purpose); invalidateError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, invalidateError
	}

	otpRecord := entityAuth.OTPVerification{
		ID:          time.Now().UnixNano(),
		PhoneNumber: phoneNumber,
		Code:        generatedCode,
		Purpose:     purpose,
		ExpiresAt:   currentTime + int64(service.expirationSec),
		IsUsed:      false,
	}

	if createError := service.repository.CreateOTP(otpRecord); createError != nil {
		return dtoAuth.SendOTPResponse{}, http.StatusInternalServerError, createError
	}

	deliveryPayload := sms.MessagePayload{
		Mobile:           phoneNumber,
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

func generateNumericCode(length int) (string, error) {
	maximumValue := big.NewInt(1)
	for index := 0; index < length; index++ {
		maximumValue.Mul(maximumValue, big.NewInt(10))
	}

	randomBigInt, randomError := rand.Int(rand.Reader, maximumValue)
	if randomError != nil {
		return "", randomError
	}

	formatString := fmt.Sprintf("%%0%dd", length)
	return fmt.Sprintf(formatString, randomBigInt.Int64()), nil
}
