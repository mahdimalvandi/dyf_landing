package dto

// PaginationQuery represents common query parameters for paginated endpoints
type PaginationQuery struct {
	Page  int `query:"page" json:"page"`
	Limit int `query:"limit" json:"limit"`
}

// GetPage returns normalized 1-based page number
func (p *PaginationQuery) GetPage() int {
	if p.Page <= 0 {
		return 1
	}
	return p.Page
}

// GetLimit returns normalized item limit per page
func (p *PaginationQuery) GetLimit() int {
	if p.Limit <= 0 || p.Limit > 100 {
		return 20
	}
	return p.Limit
}

// GetOffset calculates database query offset
func (p *PaginationQuery) GetOffset() int {
	return (p.GetPage() - 1) * p.GetLimit()
}
