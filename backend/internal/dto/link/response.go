package link

import (
	dtoShoe "dyf-backend/internal/dto/shoe"
	"dyf-backend/pkg/pagination"
)

type LinkItemResponse struct {
	IsDirectAccess         bool   `json:"isDirectAccess"`
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
	LastAccessedAt         int64  `json:"lastAccessedAt"`
}

type LinkDetailResponse struct {
	LinkItemResponse
	ShoeIDs []int64 `json:"shoeIDs"`
}

type LinkListResponse struct {
	Items      []LinkItemResponse    `json:"items"`
	Pagination pagination.Pagination `json:"pagination"`
}

type CatalogAccessResponse struct {
	Shoes            []dtoShoe.ShoeItemResponse `json:"shoes"`
	LinkID           int64                      `json:"linkID"`
	RecipientName    string                     `json:"recipientName"`
	AuthMethod       string                     `json:"authMethod"`
	Status           string                     `json:"status"`
	FirstViewedAt    int64                      `json:"firstViewedAt"`
	ViewingExpiresAt int64                      `json:"viewingExpiresAt"`
	LastAccessedAt   int64                      `json:"lastAccessedAt"`
	RemainingSeconds int64                      `json:"remainingSeconds"`
	ShoesCount       int                        `json:"shoesCount"`
}

type CatalogStatsResponse struct {
	Last7DaysViews     int64 `json:"last7DaysViews"`
	TotalAccessedLinks int64 `json:"totalAccessedLinks"`
}
