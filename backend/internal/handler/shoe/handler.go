package shoe

import serviceShoe "dyf-backend/internal/service/shoe"

type Handler struct {
	service serviceShoe.Service
}

func NewHandler(service serviceShoe.Service) Handler {
	return Handler{
		service: service,
	}
}
