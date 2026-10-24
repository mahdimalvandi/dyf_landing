package customer

import "strings"

func (request *CreateCustomerRequest) Normalize() {
	request.FirstNameFa = strings.TrimSpace(request.FirstNameFa)
	request.LastNameFa = strings.TrimSpace(request.LastNameFa)
	request.FirstNameEn = strings.TrimSpace(request.FirstNameEn)
	request.LastNameEn = strings.TrimSpace(request.LastNameEn)
	request.StoreName = strings.TrimSpace(request.StoreName)
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
	if request.IsActive == nil {
		defaultActiveStatus := true
		request.IsActive = &defaultActiveStatus
	}
}

func (request *UpdateCustomerRequest) Normalize() {
	request.FirstNameFa = strings.TrimSpace(request.FirstNameFa)
	request.LastNameFa = strings.TrimSpace(request.LastNameFa)
	request.FirstNameEn = strings.TrimSpace(request.FirstNameEn)
	request.LastNameEn = strings.TrimSpace(request.LastNameEn)
	request.StoreName = strings.TrimSpace(request.StoreName)
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
}

func (filter *ListCustomersFilter) Normalize() {
	filter.Pagination.Normalize()
	filter.Search = strings.TrimSpace(filter.Search)
	filter.Status = strings.ToLower(strings.TrimSpace(filter.Status))
}
