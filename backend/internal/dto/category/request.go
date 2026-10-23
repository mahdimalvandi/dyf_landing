package category

type CreateCategoryRequest struct {
	Title string `json:"title" validate:"required,min=2,max=100"`
}

type UpdateCategoryRequest struct {
	Title string `json:"title" validate:"required,min=2,max=100"`
}
