package customer

import "dyf-backend/pkg/pagination"

type CreateCustomerRequest struct {
	FirstNameFa string `json:"firstNameFa" validate:"required,min=2,max=100"`
	LastNameFa  string `json:"lastNameFa" validate:"required,min=2,max=100"`
	FirstNameEn string `json:"firstNameEn" validate:"omitempty,max=100"`
	LastNameEn  string `json:"lastNameEn" validate:"omitempty,max=100"`
	StoreName   string `json:"storeName" validate:"omitempty,max=200"`
	PhoneNumber string `json:"phoneNumber" validate:"required,iran_phone"`
	IsActive    *bool  `json:"isActive"`
}

type UpdateCustomerRequest struct {
	FirstNameFa string `json:"firstNameFa" validate:"required,min=2,max=100"`
	LastNameFa  string `json:"lastNameFa" validate:"required,min=2,max=100"`
	FirstNameEn string `json:"firstNameEn" validate:"omitempty,max=100"`
	LastNameEn  string `json:"lastNameEn" validate:"omitempty,max=100"`
	StoreName   string `json:"storeName" validate:"omitempty,max=200"`
	PhoneNumber string `json:"phoneNumber" validate:"required,iran_phone"`
	IsActive    *bool  `json:"isActive"`
}

type ChangeCustomerStatusRequest struct {
	IsActive *bool `json:"isActive" validate:"required"`
}

type ListCustomersFilter struct {
	pagination.Pagination
	Search string `query:"search"`
	Status string `query:"status"`
}

type CustomerSendOTPRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,numeric,len=11"`
}

type CustomerVerifyOTPRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,numeric,len=11"`
	Code        string `json:"code" validate:"required,numeric,len=5"`
}
