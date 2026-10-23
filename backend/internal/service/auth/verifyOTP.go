package auth

import (
	"net/http"
	"time"

	dtoauth "dyf-backend/internal/dto/auth"
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

	return dtoauth.VerifyOTPResponse{
		Admin: dtoauth.AdminProfileResponse{
			ID:          adminUser.ID,
			FirstName:   adminUser.FirstName,
			LastName:    adminUser.LastName,
			PhoneNumber: adminUser.PhoneNumber,
		},
		Token: "",
	}, http.StatusOK, nil
}
