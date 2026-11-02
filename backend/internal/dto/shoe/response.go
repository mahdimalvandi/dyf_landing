package shoe

import (
	"dyf-backend/pkg/media"
	"dyf-backend/pkg/pagination"
	"time"
)

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

func (item *ShoeItemResponse) SignMedia(expiresAt int64, grant string) {
	item.CoverImage = media.SignURL(item.CoverImage, expiresAt, grant)
	item.Images = media.SignURLs(item.Images, expiresAt, grant)
	item.Videos = media.SignURLs(item.Videos, expiresAt, grant)
}

func (item ShoeDetailResponse) PrepareResponse() interface{} {
	item.SignMedia(time.Now().Add(time.Hour).Unix(), "")
	return item
}

func (list ShoeListResponse) PrepareResponse() interface{} {
	list.Items = append([]ShoeItemResponse(nil), list.Items...)
	for i := range list.Items {
		list.Items[i].SignMedia(time.Now().Add(time.Hour).Unix(), "")
	}
	return list
}

func (item UploadMediaResponse) PrepareResponse() interface{} {
	item.URL = media.SignURL(item.URL, time.Now().Add(time.Hour).Unix(), "")
	return item
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
