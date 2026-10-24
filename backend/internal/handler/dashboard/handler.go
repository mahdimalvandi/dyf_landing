package dashboard

import serviceDashboard "dyf-backend/internal/service/dashboard"

type Handler struct {
	service serviceDashboard.Service
}

func NewHandler(service serviceDashboard.Service) Handler {
	return Handler{
		service: service,
	}
}
