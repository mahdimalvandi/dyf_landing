package customer

import (
	"net/http"

	dtoCustomer "dyf-backend/internal/dto/customer"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) ChangeStatus(customerID int64, request dtoCustomer.ChangeCustomerStatusRequest) (dtoCustomer.CustomerResponse, int, error) {
	existingCustomer, found, findError := service.customerRepository.FindCustomerByID(customerID)
	if findError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoCustomer.CustomerResponse{}, http.StatusNotFound, staticErrors.ErrCustomerNotFound
	}

	if updateError := service.customerRepository.UpdateCustomerStatus(customerID, *request.IsActive); updateError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, updateError
	}

	existingCustomer.IsActive = *request.IsActive

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
