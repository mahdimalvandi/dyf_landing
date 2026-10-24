package link

import (
	repoCustomer "dyf-backend/internal/repository/customer"
	repoLink "dyf-backend/internal/repository/link"
	repoShoe "dyf-backend/internal/repository/shoe"
)

type Service struct {
	linkRepository     repoLink.Repository
	shoeRepository     repoShoe.Repository
	customerRepository repoCustomer.Repository
}

func NewService(linkRepository repoLink.Repository, shoeRepository repoShoe.Repository, customerRepository repoCustomer.Repository) Service {
	return Service{
		linkRepository:     linkRepository,
		shoeRepository:     shoeRepository,
		customerRepository: customerRepository,
	}
}
