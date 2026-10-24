package dashboard

import repoDashboard "dyf-backend/internal/repository/dashboard"

type Service struct {
	dashboardRepository repoDashboard.Repository
}

func NewService(dashboardRepository repoDashboard.Repository) Service {
	return Service{
		dashboardRepository: dashboardRepository,
	}
}
