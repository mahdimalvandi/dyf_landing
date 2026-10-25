package auth

import "net/http"

func (service Service) Logout(tokenHash string) (int, error) {
	if tokenHash == "" {
		return http.StatusOK, nil
	}

	if deactivateError := service.repository.DeactivateDeviceByTokenHash(tokenHash); deactivateError != nil {
		return http.StatusInternalServerError, deactivateError
	}

	return http.StatusOK, nil
}
