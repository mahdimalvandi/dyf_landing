package link

import "dyf-backend/pkg/pagination"

type LinkItemResponse struct {
	ID                     int64  `json:"ID"`
	LinkID                 int64  `json:"linkID"`
	Token                  string `json:"token"`
	URL                    string `json:"url"`
	CustomerID             int64  `json:"customerID"`
	RecipientName          string `json:"recipientName"`
	PhoneNumber            string `json:"phoneNumber"`
	AuthMethod             string `json:"authMethod"`
	ShoesCount             int    `json:"shoesCount"`
	ViewingDurationMinutes int    `json:"viewingDurationMinutes"`
	ExpiresAt              int64  `json:"expiresAt"`
	FirstViewedAt          int64  `json:"firstViewedAt"`
	ViewingExpiresAt       int64  `json:"viewingExpiresAt"`
	IsActive               bool   `json:"isActive"`
	Status                 string `json:"status"`
}

type LinkDetailResponse struct {
	LinkItemResponse
	ShoeIDs []int64 `json:"shoeIDs"`
}

type LinkListResponse struct {
	Items      []LinkItemResponse    `json:"items"`
	Pagination pagination.Pagination `json:"pagination"`
}
