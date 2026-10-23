package auth

import "net/http"

func (service Service) Logout() (int, error) {
	return http.StatusOK, nil
}
