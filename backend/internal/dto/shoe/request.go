package shoe

import "dyf-backend/pkg/pagination"

type CreateShoeRequest struct {
	Title       string   `json:"title" validate:"required,min=2,max=255"`
	Description string   `json:"description"`
	CoverImage  string   `json:"coverImage"`
	CategoryIDs []int64  `json:"categoryIDs"`
	Colors      []string `json:"colors"`
	Sizes       []int    `json:"sizes"`
	Images      []string `json:"images"`
	Videos      []string `json:"videos"`
}

type UpdateShoeRequest struct {
	Title       string   `json:"title" validate:"required,min=2,max=255"`
	Description string   `json:"description"`
	CoverImage  string   `json:"coverImage"`
	CategoryIDs []int64  `json:"categoryIDs"`
	Colors      []string `json:"colors"`
	Sizes       []int    `json:"sizes"`
	Images      []string `json:"images"`
	Videos      []string `json:"videos"`
}

type SetCoverRequest struct {
	CoverImage string `json:"coverImage" validate:"required,min=1"`
}

type RemoveMediaRequest struct {
	MediaURL string `json:"mediaURL" validate:"required,min=1"`
}

type ListShoesFilter struct {
	pagination.Pagination
	CategoryID int64  `query:"categoryID"`
	Search     string `query:"search"`
}
