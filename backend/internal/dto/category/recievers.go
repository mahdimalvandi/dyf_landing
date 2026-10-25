package category

import "strings"

func (request *CreateCategoryRequest) Normalize() {
	request.Title = strings.TrimSpace(request.Title)
}

func (request *UpdateCategoryRequest) Normalize() {
	request.Title = strings.TrimSpace(request.Title)
}
