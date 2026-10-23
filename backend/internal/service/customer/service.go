package customer

import (
	repoCustomer "dyf-backend/internal/repository/customer"
)

type Service struct {
	customerRepository repoCustomer.Repository
}

func NewService(customerRepository repoCustomer.Repository) Service {
	return Service{
		customerRepository: customerRepository,
	}
}
