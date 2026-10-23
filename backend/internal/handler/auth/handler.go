package auth

import serviceauth "dyf-backend/internal/service/auth"

type Handler struct {
	service serviceauth.Service
}

func NewHandler(service serviceauth.Service) Handler {
	return Handler{
		service: service,
	}
}
