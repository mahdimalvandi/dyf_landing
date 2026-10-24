package category

type CategoryResponse struct {
	ID        int64  `json:"ID"`
	Title     string `json:"title"`
	ShoeCount int64  `json:"shoeCount"`
}
