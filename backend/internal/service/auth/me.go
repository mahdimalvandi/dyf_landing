package auth

import (
	"net/http"

	dtoauth "dyf-backend/internal/dto/auth"
	staticerrors "dyf-backend/statics/errors"
)

func (service Service) Me(userID int64) (dtoauth.AdminProfileResponse, int, error) {
	adminUser, found, findError := service.repository.FindAdminByID(userID)
	if findError != nil {
		return dtoauth.AdminProfileResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoauth.AdminProfileResponse{}, http.StatusNotFound, staticerrors.ErrUserNotFound
	}
	if !adminUser.IsActive {
		return dtoauth.AdminProfileResponse{}, http.StatusForbidden, staticerrors.ErrAdminInactive
	}

	return dtoauth.AdminProfileResponse{
		ID:          adminUser.ID,
		FirstName:   adminUser.FirstName,
		LastName:    adminUser.LastName,
		PhoneNumber: adminUser.PhoneNumber,
	}, http.StatusOK, nil
}
