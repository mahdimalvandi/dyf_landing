package shoe

import (
	repoCategory "dyf-backend/internal/repository/category"
	repoShoe "dyf-backend/internal/repository/shoe"
)

type Service struct {
	shoeRepository     repoShoe.Repository
	categoryRepository repoCategory.Repository
}

func NewService(shoeRepository repoShoe.Repository, categoryRepository repoCategory.Repository) Service {
	return Service{
		shoeRepository:     shoeRepository,
		categoryRepository: categoryRepository,
	}
}
