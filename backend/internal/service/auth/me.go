package auth

import (
	"net/http"

	dtoAuth "dyf-backend/internal/dto/auth"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Me(userID int64) (dtoAuth.AdminProfileResponse, int, error) {
	adminUser, found, findError := service.repository.FindAdminByID(userID)
	if findError != nil {
		return dtoAuth.AdminProfileResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoAuth.AdminProfileResponse{}, http.StatusNotFound, staticErrors.ErrUserNotFound
	}
	if !adminUser.IsActive {
		return dtoAuth.AdminProfileResponse{}, http.StatusForbidden, staticErrors.ErrAdminInactive
	}

	return dtoAuth.AdminProfileResponse{
		ID:          adminUser.ID,
		FirstName:   adminUser.FirstName,
		LastName:    adminUser.LastName,
		PhoneNumber: adminUser.PhoneNumber,
	}, http.StatusOK, nil
}
