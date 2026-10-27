package inquiry

import (
	entityInquiry "dyf-backend/internal/entity/inquiry"
	"gorm.io/gorm"
)

type Repository struct{ databaseConnection *gorm.DB }

func NewRepository(databaseConnection *gorm.DB) Repository {
	return Repository{databaseConnection: databaseConnection}
}
func (repository Repository) Create(record entityInquiry.Inquiry) error {
	return repository.databaseConnection.Create(&record).Error
}
func (repository Repository) List() ([]entityInquiry.Inquiry, error) {
	records := make([]entityInquiry.Inquiry, 0)
	result := repository.databaseConnection.Order(`"ID" DESC`).Limit(100).Find(&records)
	return records, result.Error
}
