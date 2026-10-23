package auth

type LogoutService struct{}

func NewLogoutService() LogoutService {
	return LogoutService{}
}

func (service LogoutService) Execute() error {
	return nil
}
