package pagination

import (
	"math"

	"gorm.io/gorm"
)

type Pagination struct {
	Page       int   `json:"page" query:"page"`
	Limit      int   `json:"limit" query:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

func (pagination *Pagination) Normalize() {
	if pagination.Page <= 0 {
		pagination.Page = 1
	}
	if pagination.Limit <= 0 || pagination.Limit > 50 {
		pagination.Limit = 12
	}
}

func (pagination Pagination) GetScope() func(databaseConnection *gorm.DB) *gorm.DB {
	return func(databaseConnection *gorm.DB) *gorm.DB {
		offset := (pagination.Page - 1) * pagination.Limit
		return databaseConnection.Offset(offset).Limit(pagination.Limit)
	}
}

func (pagination *Pagination) Calculate(totalRecords int64) {
	pagination.Total = totalRecords
	if totalRecords > 0 && pagination.Limit > 0 {
		pagination.TotalPages = int(math.Ceil(float64(totalRecords) / float64(pagination.Limit)))
	} else {
		pagination.TotalPages = 0
	}
}
