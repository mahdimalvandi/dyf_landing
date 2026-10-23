package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"

	dtoauth "dyf-backend/internal/dto/auth"
	entityauth "dyf-backend/internal/entity/auth"
	"dyf-backend/pkg/sms"
	constantsauth "dyf-backend/statics/constants/auth"
	staticerrors "dyf-backend/statics/errors"
)

func (service Service) SendOTP(request dtoauth.SendOTPRequest) (dtoauth.SendOTPResponse, int, error) {
	adminUser, found, findError := service.repository.FindAdminByPhoneNumber(request.PhoneNumber)
	if findError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoauth.SendOTPResponse{}, http.StatusNotFound, staticerrors.ErrUserNotFound
	}
	if !adminUser.IsActive {
		return dtoauth.SendOTPResponse{}, http.StatusForbidden, staticerrors.ErrAdminInactive
	}

	currentTime := time.Now().Unix()

	latestOTP, otpFound, fetchError := service.repository.FindLatestActiveOTP(request.PhoneNumber, constantsauth.PurposeAdminLogin)
	if fetchError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusInternalServerError, fetchError
	}

	if otpFound {
		elapsedSeconds := currentTime - (latestOTP.ExpiresAt - int64(service.expirationSec))
		if elapsedSeconds < int64(service.cooldownSec) && currentTime < latestOTP.ExpiresAt {
			return dtoauth.SendOTPResponse{}, http.StatusTooManyRequests, staticerrors.ErrOTPCooldownActive
		}
	}

	nanosecondsThreshold := (currentTime - constantsauth.MaxRequestsWindowSec) * int64(time.Second)
	recentCount, countError := service.repository.CountRecentOTPRequests(request.PhoneNumber, constantsauth.PurposeAdminLogin, nanosecondsThreshold)
	if countError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusInternalServerError, countError
	}
	if recentCount >= constantsauth.MaxRequestsPerWindow {
		return dtoauth.SendOTPResponse{}, http.StatusTooManyRequests, staticerrors.ErrTooManyRequests
	}

	generatedCode, codeError := generateNumericCode(constantsauth.DefaultCodeLength)
	if codeError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusInternalServerError, codeError
	}

	if invalidateError := service.repository.InvalidatePreviousOTPs(request.PhoneNumber, constantsauth.PurposeAdminLogin); invalidateError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusInternalServerError, invalidateError
	}

	otpRecord := entityauth.OTPVerification{
		ID:          time.Now().UnixNano(),
		PhoneNumber: request.PhoneNumber,
		Code:        generatedCode,
		Purpose:     constantsauth.PurposeAdminLogin,
		ExpiresAt:   currentTime + int64(service.expirationSec),
		IsUsed:      false,
	}

	if createError := service.repository.CreateOTP(otpRecord); createError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusInternalServerError, createError
	}

	deliveryPayload := sms.MessagePayload{
		Mobile:           request.PhoneNumber,
		Code:             generatedCode,
		TemplateID:       service.msgwayTemplate,
		ExpiresInSeconds: service.expirationSec,
	}

	if deliveryError := service.smsSender.SendOTP(deliveryPayload); deliveryError != nil {
		return dtoauth.SendOTPResponse{}, http.StatusBadGateway, staticerrors.ErrSMSDeliveryFailed
	}

	return dtoauth.SendOTPResponse{
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
