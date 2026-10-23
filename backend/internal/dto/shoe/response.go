package shoe

import "dyf-backend/pkg/pagination"

type ShoeCategorySummary struct {
	ID    int64  `json:"ID"`
	Title string `json:"title"`
}

type ShoeItemResponse struct {
	ID          int64                 `json:"ID"`
	ModelID     int64                 `json:"modelID"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	CoverImage  string                `json:"coverImage"`
	Categories  []ShoeCategorySummary `json:"categories"`
	Colors      []string              `json:"colors"`
	ColorsCount int                   `json:"colorsCount"`
	Sizes       []int                 `json:"sizes"`
	SizesCount  int                   `json:"sizesCount"`
	Images      []string              `json:"images"`
	Videos      []string              `json:"videos"`
}

type ShoeDetailResponse struct {
	ShoeItemResponse
	CategoryIDs []int64 `json:"categoryIDs"`
}

type ShoeListResponse struct {
	Items      []ShoeItemResponse    `json:"items"`
	Pagination pagination.Pagination `json:"pagination"`
}

type UploadMediaResponse struct {
	URL      string `json:"url"`
	FileType string `json:"fileType"`
	FileSize int64  `json:"fileSize"`
}
