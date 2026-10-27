package auth

import (
	dtoAuth "dyf-backend/internal/dto/auth"
	entityLink "dyf-backend/internal/entity/link"
	staticErrors "dyf-backend/statics/errors"
	"net/http"
	"time"
)

const customerLoginPurpose = "customerLogin"

func (service Service) customerAccess(phoneNumber string) (entityLink.AccessLink, int, error) {
	record, found, findError := service.repository.FindCustomerAccess(phoneNumber)
	if findError != nil {
		return record, http.StatusInternalServerError, findError
	}
	if !found || !record.IsActive {
		return record, http.StatusForbidden, staticErrors.ErrLinkInactive
	}
	now := time.Now().Unix()
	if (record.ExpiresAt > 0 && now >= record.ExpiresAt) || (record.ViewingExpiresAt > 0 && now >= record.ViewingExpiresAt) {
		return record, http.StatusGone, staticErrors.ErrLinkExpired
	}
	return record, http.StatusOK, nil
}

func (service Service) SendCustomerOTP(request dtoAuth.SendOTPRequest) (dtoAuth.SendOTPResponse, int, error) {
	if _, status, accessError := service.customerAccess(request.PhoneNumber); accessError != nil {
		return dtoAuth.SendOTPResponse{}, status, accessError
	}
	return service.sendOTP(request.PhoneNumber, customerLoginPurpose)
}

type CustomerLoginResponse struct {
	Token string `json:"token"`
}

func (service Service) VerifyCustomerOTP(request dtoAuth.VerifyOTPRequest) (CustomerLoginResponse, int, error) {
	record, status, accessError := service.customerAccess(request.PhoneNumber)
	if accessError != nil {
		return CustomerLoginResponse{}, status, accessError
	}
	otp, found, findError := service.repository.FindLatestActiveOTP(request.PhoneNumber, customerLoginPurpose)
	if findError != nil {
		return CustomerLoginResponse{}, http.StatusInternalServerError, findError
	}
	if !found || otp.Code != request.Code {
		return CustomerLoginResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}
	if time.Now().Unix() >= otp.ExpiresAt {
		return CustomerLoginResponse{}, http.StatusBadRequest, staticErrors.ErrOTPExpired
	}
	if consumeError := service.repository.MarkOTPAsUsed(otp.ID); consumeError != nil {
		return CustomerLoginResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidOTP
	}
	return CustomerLoginResponse{Token: record.Token}, http.StatusOK, nil
}
