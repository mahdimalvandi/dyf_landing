package inquiry

import (
	dtoInquiry "dyf-backend/internal/dto/inquiry"
	entityInquiry "dyf-backend/internal/entity/inquiry"
	repoInquiry "dyf-backend/internal/repository/inquiry"
	"net/http"
	"time"
)

type Service struct{ repository repoInquiry.Repository }

func NewService(repository repoInquiry.Repository) Service { return Service{repository: repository} }
func (service Service) Create(request dtoInquiry.CreateRequest) (entityInquiry.Inquiry, int, error) {
	record := entityInquiry.Inquiry{ID: time.Now().UnixNano(), StoreName: request.StoreName, CityMarket: request.CityMarket, PhoneNumber: request.PhoneNumber, LinePreference: request.LinePreference, Source: request.Source, Status: "pending"}
	if createError := service.repository.Create(record); createError != nil {
		return entityInquiry.Inquiry{}, http.StatusInternalServerError, createError
	}
	return record, http.StatusCreated, nil
}
func (service Service) List() ([]entityInquiry.Inquiry, int, error) {
	records, listError := service.repository.List()
	if listError != nil {
		return nil, http.StatusInternalServerError, listError
	}
	return records, http.StatusOK, nil
}
