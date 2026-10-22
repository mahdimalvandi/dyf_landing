package dto

type PaginationQuery struct {
	Page  int `query:"page" json:"page"`
	Limit int `query:"limit" json:"limit"`
}

func (pagination PaginationQuery) NormalizePage() int {
	if pagination.Page <= 0 {
		return 1
	}
	return pagination.Page
}

func (pagination PaginationQuery) NormalizeLimit() int {
	if pagination.Limit <= 0 || pagination.Limit > 100 {
		return 20
	}
	return pagination.Limit
}

func (pagination PaginationQuery) CalculateOffset() int {
	return (pagination.NormalizePage() - 1) * pagination.NormalizeLimit()
}
