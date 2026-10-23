package customer

import (
	"net/http"

	dtoCustomer "dyf-backend/internal/dto/customer"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Detail(customerID int64) (dtoCustomer.CustomerResponse, int, error) {
	customerRecord, found, findError := service.customerRepository.FindCustomerByID(customerID)
	if findError != nil {
		return dtoCustomer.CustomerResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoCustomer.CustomerResponse{}, http.StatusNotFound, staticErrors.ErrCustomerNotFound
	}

	return dtoCustomer.CustomerResponse{
		ID:          customerRecord.ID,
		FirstNameFa: customerRecord.FirstNameFa,
		LastNameFa:  customerRecord.LastNameFa,
		FirstNameEn: customerRecord.FirstNameEn,
		LastNameEn:  customerRecord.LastNameEn,
		StoreName:   customerRecord.StoreName,
		PhoneNumber: customerRecord.PhoneNumber,
		IsActive:    customerRecord.IsActive,
	}, http.StatusOK, nil
}
