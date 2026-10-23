package customer

import serviceCustomer "dyf-backend/internal/service/customer"

type Handler struct {
	service serviceCustomer.Service
}

func NewHandler(service serviceCustomer.Service) Handler {
	return Handler{
		service: service,
	}
}
