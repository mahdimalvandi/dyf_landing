package customer

import (
	"net/http"

	dtoCustomer "dyf-backend/internal/dto/customer"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Update(customerID int64, request dtoCustomer.UpdateCustomerRequest) (dtoCustomer.CustomerResponse, int, error) {
	existingCustomer, found, findError := service.customerRepository.FindCustomerByID(customerID)
	if findError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoCustomer.CustomerResponse{}, http.StatusNotFound, staticErrors.ErrCustomerNotFound
	}

	if request.PhoneNumber != existingCustomer.PhoneNumber {
		conflictingCustomer, phoneExists, phoneCheckError := service.customerRepository.FindCustomerByPhone(request.PhoneNumber)
		if phoneCheckError != nil {
			return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, phoneCheckError
		}
		if phoneExists && conflictingCustomer.ID != customerID {
			return dtoCustomer.CustomerResponse{}, http.StatusConflict, staticErrors.ErrDuplicatePhone
		}
	}

	existingCustomer.FirstNameFa = request.FirstNameFa
	existingCustomer.LastNameFa = request.LastNameFa
	existingCustomer.FirstNameEn = request.FirstNameEn
	existingCustomer.LastNameEn = request.LastNameEn
	existingCustomer.StoreName = request.StoreName
	existingCustomer.PhoneNumber = request.PhoneNumber
	if request.IsActive != nil {
		existingCustomer.IsActive = *request.IsActive
	}

	if updateError := service.customerRepository.UpdateCustomer(existingCustomer); updateError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, updateError
	}

	return dtoCustomer.CustomerResponse{
		ID:          existingCustomer.ID,
		FirstNameFa: existingCustomer.FirstNameFa,
		LastNameFa:  existingCustomer.LastNameFa,
		FirstNameEn: existingCustomer.FirstNameEn,
		LastNameEn:  existingCustomer.LastNameEn,
		StoreName:   existingCustomer.StoreName,
		PhoneNumber: existingCustomer.PhoneNumber,
		IsActive:    existingCustomer.IsActive,
	}, http.StatusOK, nil
}
