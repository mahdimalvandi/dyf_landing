package auth

import (
	"time"

	dtoauth "dyf-backend/internal/dto/auth"
	repoauth "dyf-backend/internal/repository/auth"
	constantsauth "dyf-backend/statics/constants/auth"
	staticerrors "dyf-backend/statics/errors"
)

type VerifyOTPService struct {
	repository repoauth.Repository
}

func NewVerifyOTPService(repository repoauth.Repository) VerifyOTPService {
	return VerifyOTPService{
		repository: repository,
	}
}

func (service VerifyOTPService) Execute(request dtoauth.VerifyOTPRequest) (dtoauth.VerifyOTPResponse, error) {
	otpRecord, found, findError := service.repository.FindLatestActiveOTP(request.PhoneNumber, constantsauth.PurposeAdminLogin)
	if findError != nil {
		return dtoauth.VerifyOTPResponse{}, findError
	}
	if !found {
		return dtoauth.VerifyOTPResponse{}, staticerrors.ErrInvalidOTP
	}

	currentTime := time.Now().Unix()
	if currentTime > otpRecord.ExpiresAt {
		return dtoauth.VerifyOTPResponse{}, staticerrors.ErrOTPExpired
	}

	if otpRecord.Code != request.Code {
		return dtoauth.VerifyOTPResponse{}, staticerrors.ErrInvalidOTP
	}

	if markError := service.repository.MarkOTPAsUsed(otpRecord.ID); markError != nil {
		return dtoauth.VerifyOTPResponse{}, markError
	}

	adminUser, adminFound, adminError := service.repository.FindAdminByPhoneNumber(request.PhoneNumber)
	if adminError != nil {
		return dtoauth.VerifyOTPResponse{}, adminError
	}
	if !adminFound {
		return dtoauth.VerifyOTPResponse{}, staticerrors.ErrUserNotFound
	}

	return dtoauth.VerifyOTPResponse{
		Admin: dtoauth.AdminProfileResponse{
			ID:          adminUser.ID,
			FirstName:   adminUser.FirstName,
			LastName:    adminUser.LastName,
			PhoneNumber: adminUser.PhoneNumber,
		},
		Token: "",
	}, nil
}
