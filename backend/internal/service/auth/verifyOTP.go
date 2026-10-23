package auth

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	dtoauth "dyf-backend/internal/dto/auth"
	entityauth "dyf-backend/internal/entity/auth"
	constantsauth "dyf-backend/statics/constants/auth"
	staticerrors "dyf-backend/statics/errors"
)

func (service Service) VerifyOTP(request dtoauth.VerifyOTPRequest) (dtoauth.VerifyOTPResponse, int, error) {
	otpRecord, found, findError := service.repository.FindLatestActiveOTP(request.PhoneNumber, constantsauth.PurposeAdminLogin)
	if findError != nil {
		return dtoauth.VerifyOTPResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoauth.VerifyOTPResponse{}, http.StatusBadRequest, staticerrors.ErrInvalidOTP
	}

	currentTime := time.Now().Unix()
	if currentTime > otpRecord.ExpiresAt {
		return dtoauth.VerifyOTPResponse{}, http.StatusBadRequest, staticerrors.ErrOTPExpired
	}

	if otpRecord.Code != request.Code {
		return dtoauth.VerifyOTPResponse{}, http.StatusBadRequest, staticerrors.ErrInvalidOTP
	}

	if markError := service.repository.MarkOTPAsUsed(otpRecord.ID); markError != nil {
		return dtoauth.VerifyOTPResponse{}, http.StatusInternalServerError, markError
	}

	adminUser, adminFound, adminError := service.repository.FindAdminByPhoneNumber(request.PhoneNumber)
	if adminError != nil {
		return dtoauth.VerifyOTPResponse{}, http.StatusInternalServerError, adminError
	}
	if !adminFound {
		return dtoauth.VerifyOTPResponse{}, http.StatusNotFound, staticerrors.ErrUserNotFound
	}

	rawToken, tokenHash, tokenError := generateSecureOpaqueToken()
	if tokenError != nil {
		return dtoauth.VerifyOTPResponse{}, http.StatusInternalServerError, tokenError
	}

	deviceRecord := entityauth.Device{
		ID:        time.Now().UnixNano(),
		UserID:    adminUser.ID,
		UserType:  constantsauth.UserTypeAdmin,
		TokenHash: tokenHash,
		ExpiresAt: currentTime + int64(service.tokenExpirationHours*3600),
		Status:    constantsauth.DeviceStatusActive,
	}

	if createDeviceError := service.repository.CreateDevice(deviceRecord); createDeviceError != nil {
		return dtoauth.VerifyOTPResponse{}, http.StatusInternalServerError, createDeviceError
	}

	return dtoauth.VerifyOTPResponse{
		Admin: dtoauth.AdminProfileResponse{
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
