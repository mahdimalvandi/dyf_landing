package category

import repoCategory "dyf-backend/internal/repository/category"

type Service struct {
	repository repoCategory.Repository
}

func NewService(repository repoCategory.Repository) Service {
	return Service{
		repository: repository,
	}
}
