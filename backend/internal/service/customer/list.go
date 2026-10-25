package customer

import (
	"net/http"

	dtoCustomer "dyf-backend/internal/dto/customer"
	entityCustomer "dyf-backend/internal/entity/customer"
)

func (service Service) List(filter dtoCustomer.ListCustomersFilter) (dtoCustomer.CustomerListResponse, int, error) {
	customersList, totalCount, listError := service.customerRepository.ListCustomers(filter.Search, filter.Status, filter.Pagination)
	if listError != nil {
		return dtoCustomer.CustomerListResponse{}, http.StatusInternalServerError, listError
	}

	filter.Pagination.Calculate(totalCount)

	preparedItems := service.prepareCustomerItems(customersList)

	return dtoCustomer.CustomerListResponse{
		Items:      preparedItems,
		Pagination: filter.Pagination,
	}, http.StatusOK, nil
}

func (service Service) prepareCustomerItems(customersList []entityCustomer.Customer) []dtoCustomer.CustomerResponse {
	responseItems := make([]dtoCustomer.CustomerResponse, 0, len(customersList))
	for index := range customersList {
		responseItems = append(responseItems, service.mapToCustomerResponse(customersList[index]))
	}
	return responseItems
}

func (service Service) mapToCustomerResponse(customerRecord entityCustomer.Customer) dtoCustomer.CustomerResponse {
	return dtoCustomer.CustomerResponse{
		ID:          customerRecord.ID,
		FirstNameFa: customerRecord.FirstNameFa,
		LastNameFa:  customerRecord.LastNameFa,
		FirstNameEn: customerRecord.FirstNameEn,
		LastNameEn:  customerRecord.LastNameEn,
		StoreName:   customerRecord.StoreName,
		PhoneNumber: customerRecord.PhoneNumber,
		IsActive:    customerRecord.IsActive,
	}
}
