package customer

import (
	"net/http"
	"time"

	dtoCustomer "dyf-backend/internal/dto/customer"
	entityCustomer "dyf-backend/internal/entity/customer"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Create(request dtoCustomer.CreateCustomerRequest) (dtoCustomer.CustomerResponse, int, error) {
	_, phoneExists, findError := service.customerRepository.FindCustomerByPhone(request.PhoneNumber)
	if findError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, findError
	}
	if phoneExists {
		return dtoCustomer.CustomerResponse{}, http.StatusConflict, staticErrors.ErrDuplicatePhone
	}

	activeStatus := true
	if request.IsActive != nil {
		activeStatus = *request.IsActive
	}

	customerRecord := entityCustomer.Customer{
		ID:          time.Now().UnixNano(),
		FirstNameFa: request.FirstNameFa,
		LastNameFa:  request.LastNameFa,
		FirstNameEn: request.FirstNameEn,
		LastNameEn:  request.LastNameEn,
		StoreName:   request.StoreName,
		PhoneNumber: request.PhoneNumber,
		IsActive:    activeStatus,
	}

	createdRecord, createError := service.customerRepository.CreateCustomer(customerRecord)
	if createError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, createError
	}

	return dtoCustomer.CustomerResponse{
		ID:          createdRecord.ID,
		FirstNameFa: createdRecord.FirstNameFa,
		LastNameFa:  createdRecord.LastNameFa,
		FirstNameEn: createdRecord.FirstNameEn,
		LastNameEn:  createdRecord.LastNameEn,
		StoreName:   createdRecord.StoreName,
		PhoneNumber: createdRecord.PhoneNumber,
		IsActive:    createdRecord.IsActive,
	}, http.StatusCreated, nil
}
