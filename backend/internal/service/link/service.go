package link

import (
	repoCustomer "dyf-backend/internal/repository/customer"
	repoLink "dyf-backend/internal/repository/link"
	repoShoe "dyf-backend/internal/repository/shoe"
	serviceShoe "dyf-backend/internal/service/shoe"
)

type Service struct {
	linkRepository     repoLink.Repository
	shoeRepository     repoShoe.Repository
	customerRepository repoCustomer.Repository
	shoeService        serviceShoe.Service
}

func NewService(linkRepository repoLink.Repository, shoeRepository repoShoe.Repository, customerRepository repoCustomer.Repository, shoeService serviceShoe.Service) Service {
	return Service{
		linkRepository:     linkRepository,
		shoeRepository:     shoeRepository,
		customerRepository: customerRepository,
		shoeService:        shoeService,
	}
}
