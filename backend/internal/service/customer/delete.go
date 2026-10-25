package customer

import (
	"net/http"

	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Delete(customerID int64) (int, error) {
	_, found, findError := service.customerRepository.FindCustomerByID(customerID)
	if findError != nil {
		return http.StatusInternalServerError, findError
	}
	if !found {
		return http.StatusNotFound, staticErrors.ErrCustomerNotFound
	}

	if deleteError := service.customerRepository.DeleteCustomer(customerID); deleteError != nil {
		return http.StatusInternalServerError, deleteError
	}

	return http.StatusOK, nil
}
