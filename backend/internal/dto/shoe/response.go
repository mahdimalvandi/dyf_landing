package shoe

type ShoeCategorySummary struct {
	ID    int64  `json:"ID"`
	Title string `json:"title"`
}

type ShoeDetailResponse struct {
	ID          int64                 `json:"ID"`
	ModelID     int64                 `json:"modelID"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	CoverImage  string                `json:"coverImage"`
	Categories  []ShoeCategorySummary `json:"categories"`
	CategoryIDs []int64               `json:"categoryIDs"`
	Colors      []string              `json:"colors"`
	ColorsCount int                   `json:"colorsCount"`
	Sizes       []int                 `json:"sizes"`
	SizesCount  int                   `json:"sizesCount"`
	Images      []string              `json:"images"`
	Videos      []string              `json:"videos"`
}

type ShoeListItemResponse struct {
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

type UploadMediaResponse struct {
	URL      string `json:"url"`
	FileType string `json:"fileType"`
	FileSize int64  `json:"fileSize"`
}

type PaginationMeta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}
