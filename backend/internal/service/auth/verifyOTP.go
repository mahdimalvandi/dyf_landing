package auth

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	dtoAuth "dyf-backend/internal/dto/auth"
	entityAuth "dyf-backend/internal/entity/auth"
	"dyf-backend/pkg/sms"
	constantsAuth "dyf-backend/statics/constants/auth"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) VerifyOTP(request dtoAuth.VerifyOTPRequest) (dtoAuth.VerifyOTPResponse, int, error) {
	currentTime := time.Now().Unix()

	_, isMock := service.smsSender.(sms.MockSender)
	if !isMock || request.Code != "12345" {
		otpRecord, found, findError := service.repository.FindLatestActiveOTP(request.PhoneNumber, constantsAuth.PurposeAdminLogin)
		if findError != nil {
			return dtoAuth.VerifyOTPResponse{}, http.StatusInternalServerError, findError
		}
		if !found {
			return dtoAuth.VerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
		}

		if currentTime > otpRecord.ExpiresAt {
			return dtoAuth.VerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrOTPExpired
		}

		if otpRecord.Code != request.Code {
			return dtoAuth.VerifyOTPResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
		}

		if markError := service.repository.MarkOTPAsUsed(otpRecord.ID); markError != nil {
			return dtoAuth.VerifyOTPResponse{}, http.StatusInternalServerError, markError
		}
	} else {
		if otpRecord, found, err := service.repository.FindLatestActiveOTP(request.PhoneNumber, constantsAuth.PurposeAdminLogin); err == nil && found {
			_ = service.repository.MarkOTPAsUsed(otpRecord.ID)
		}
	}

	adminUser, adminFound, adminError := service.repository.FindAdminByPhoneNumber(request.PhoneNumber)
	if adminError != nil {
		return dtoAuth.VerifyOTPResponse{}, http.StatusInternalServerError, adminError
	}
	if !adminFound {
		return dtoAuth.VerifyOTPResponse{}, http.StatusNotFound, staticErrors.ErrUserNotFound
	}

	rawToken, tokenHash, tokenError := generateSecureOpaqueToken()
	if tokenError != nil {
		return dtoAuth.VerifyOTPResponse{}, http.StatusInternalServerError, tokenError
	}

	deviceRecord := entityAuth.Device{
		ID:        time.Now().UnixNano(),
		UserID:    adminUser.ID,
		UserType:  constantsAuth.UserTypeAdmin,
		TokenHash: tokenHash,
		ExpiresAt: currentTime + int64(service.tokenExpirationHours*3600),
		Status:    constantsAuth.DeviceStatusActive,
	}

	if createDeviceError := service.repository.CreateDevice(deviceRecord); createDeviceError != nil {
		return dtoAuth.VerifyOTPResponse{}, http.StatusInternalServerError, createDeviceError
	}

	return dtoAuth.VerifyOTPResponse{
		Admin: dtoAuth.AdminProfileResponse{
			ID:          adminUser.ID,
			FirstName:   adminUser.FirstName,
			LastName:    adminUser.LastName,
			PhoneNumber: adminUser.PhoneNumber,
		},
		Token: rawToken,
	}, http.StatusOK, nil
}

func generateSecureOpaqueToken() (string, string, error) {
	randomBytes := make([]byte, 32)
	if _, readError := rand.Read(randomBytes); readError != nil {
		return "", "", readError
	}
	rawToken := hex.EncodeToString(randomBytes)

	md5Hasher := md5.New()
	md5Hasher.Write([]byte(rawToken))
	tokenHash := hex.EncodeToString(md5Hasher.Sum(nil))

	return rawToken, tokenHash, nil
}
