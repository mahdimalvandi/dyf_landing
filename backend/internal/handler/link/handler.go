package link

import serviceLink "dyf-backend/internal/service/link"

type Handler struct {
	service serviceLink.Service
}

func NewHandler(service serviceLink.Service) Handler {
	return Handler{
		service: service,
	}
}
