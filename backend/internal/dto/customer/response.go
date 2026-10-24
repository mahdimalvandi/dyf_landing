package customer

import "dyf-backend/pkg/pagination"

type CustomerResponse struct {
	ID          int64  `json:"ID"`
	FirstNameFa string `json:"firstNameFa"`
	LastNameFa  string `json:"lastNameFa"`
	FirstNameEn string `json:"firstNameEn"`
	LastNameEn  string `json:"lastNameEn"`
	StoreName   string `json:"storeName"`
	PhoneNumber string `json:"phoneNumber"`
	IsActive    bool   `json:"isActive"`
}

type CustomerListResponse struct {
	Items      []CustomerResponse    `json:"items"`
	Pagination pagination.Pagination `json:"pagination"`
}

type CustomerLoginResponse struct {
	Customer         CustomerResponse `json:"customer"`
	Token            string           `json:"token"`
	CatalogToken     string           `json:"catalogToken,omitempty"`
	LinkID           int64            `json:"linkID,omitempty"`
	RemainingSeconds int64            `json:"remainingSeconds,omitempty"`
}
