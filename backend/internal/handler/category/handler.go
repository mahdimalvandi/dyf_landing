package category

import serviceCategory "dyf-backend/internal/service/category"

type Handler struct {
	service serviceCategory.Service
}

func NewHandler(service serviceCategory.Service) Handler {
	return Handler{
		service: service,
	}
}
