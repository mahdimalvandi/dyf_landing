package auth

import serviceAuth "dyf-backend/internal/service/auth"

type Handler struct {
	service serviceAuth.Service
}

func NewHandler(service serviceAuth.Service) Handler {
	return Handler{
		service: service,
	}
}
