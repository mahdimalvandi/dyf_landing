package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	dtoauth "dyf-backend/internal/dto/auth"
	entityauth "dyf-backend/internal/entity/auth"
	repoauth "dyf-backend/internal/repository/auth"
	"dyf-backend/pkg/sms"
	constantsauth "dyf-backend/statics/constants/auth"
	staticerrors "dyf-backend/statics/errors"
)

type SendOTPService struct {
	repository      repoauth.Repository
	smsSender       sms.Sender
	expirationSec   int
	cooldownSec     int
	msgwayTemplate  int
}

func NewSendOTPService(
	repository repoauth.Repository,
	smsSender sms.Sender,
	expirationSec int,
	cooldownSec int,
	msgwayTemplate int,
) SendOTPService {
	return SendOTPService{
		repository:     repository,
		smsSender:      smsSender,
		expirationSec:  expirationSec,
		cooldownSec:    cooldownSec,
		msgwayTemplate: msgwayTemplate,
	}
}

func (service SendOTPService) Execute(request dtoauth.SendOTPRequest) (dtoauth.SendOTPResponse, error) {
	adminUser, found, findError := service.repository.FindAdminByPhoneNumber(request.PhoneNumber)
	if findError != nil {
		return dtoauth.SendOTPResponse{}, findError
	}
	if !found {
		return dtoauth.SendOTPResponse{}, staticerrors.ErrUserNotFound
	}
	if !adminUser.IsActive {
		return dtoauth.SendOTPResponse{}, staticerrors.ErrAdminInactive
	}

	currentTime := time.Now().Unix()

	latestOTP, otpFound, fetchError := service.repository.FindLatestActiveOTP(request.PhoneNumber, constantsauth.PurposeAdminLogin)
	if fetchError != nil {
		return dtoauth.SendOTPResponse{}, fetchError
	}

	if otpFound {
		elapsedSeconds := currentTime - (latestOTP.ExpiresAt - int64(service.expirationSec))
		if elapsedSeconds < int64(service.cooldownSec) && currentTime < latestOTP.ExpiresAt {
			return dtoauth.SendOTPResponse{}, staticerrors.ErrOTPCooldownActive
		}
	}

	nanosecondsThreshold := (currentTime - constantsauth.MaxRequestsWindowSec) * int64(time.Second)
	recentCount, countError := service.repository.CountRecentOTPRequests(request.PhoneNumber, constantsauth.PurposeAdminLogin, nanosecondsThreshold)
	if countError != nil {
		return dtoauth.SendOTPResponse{}, countError
	}
	if recentCount >= constantsauth.MaxRequestsPerWindow {
		return dtoauth.SendOTPResponse{}, staticerrors.ErrTooManyRequests
	}

	generatedCode, codeError := generateNumericCode(constantsauth.DefaultCodeLength)
	if codeError != nil {
		return dtoauth.SendOTPResponse{}, codeError
	}

	if invalidateError := service.repository.InvalidatePreviousOTPs(request.PhoneNumber, constantsauth.PurposeAdminLogin); invalidateError != nil {
		return dtoauth.SendOTPResponse{}, invalidateError
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
		return dtoauth.SendOTPResponse{}, createError
	}

	deliveryPayload := sms.MessagePayload{
		Mobile:           request.PhoneNumber,
		Code:             generatedCode,
		TemplateID:       service.msgwayTemplate,
		ExpiresInSeconds: service.expirationSec,
	}

	if deliveryError := service.smsSender.SendOTP(deliveryPayload); deliveryError != nil {
		return dtoauth.SendOTPResponse{}, staticerrors.ErrSMSDeliveryFailed
	}

	return dtoauth.SendOTPResponse{
		ExpiresInSeconds: service.expirationSec,
	}, nil
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
