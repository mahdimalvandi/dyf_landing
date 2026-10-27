package link

import "dyf-backend/pkg/pagination"

type CreateLinkRequest struct {
	IsDirectAccess         bool    `json:"isDirectAccess"`
	CustomerID             int64   `json:"customerID"`
	RecipientName          string  `json:"recipientName" validate:"required,min=2,max=200"`
	PhoneNumber            string  `json:"phoneNumber"`
	AuthMethod             string  `json:"authMethod"`
	ShoeIDs                []int64 `json:"shoeIDs" validate:"required,min=1"`
	ViewingDurationMinutes int     `json:"viewingDurationMinutes" validate:"min=0"`
	ExpiresAt              int64   `json:"expiresAt" validate:"min=0"`
}

type UpdateLinkRequest struct {
	IsDirectAccess         bool    `json:"isDirectAccess"`
	CustomerID             int64   `json:"customerID"`
	RecipientName          string  `json:"recipientName" validate:"required,min=2,max=200"`
	PhoneNumber            string  `json:"phoneNumber"`
	AuthMethod             string  `json:"authMethod"`
	ShoeIDs                []int64 `json:"shoeIDs" validate:"required,min=1"`
	ViewingDurationMinutes int     `json:"viewingDurationMinutes" validate:"min=0"`
	ExpiresAt              int64   `json:"expiresAt" validate:"min=0"`
}

type ListLinksFilter struct {
	pagination.Pagination
	Search     string `query:"search"`
	Status     string `query:"status"`
	CustomerID int64  `query:"customerID"`
}
