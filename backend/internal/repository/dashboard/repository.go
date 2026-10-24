package dashboard

import (
	entityCustomer "dyf-backend/internal/entity/customer"
	entityLink "dyf-backend/internal/entity/link"
	entityShoe "dyf-backend/internal/entity/shoe"

	"gorm.io/gorm"
)

type Repository struct {
	databaseConnection *gorm.DB
}

func NewRepository(databaseConnection *gorm.DB) Repository {
	return Repository{
		databaseConnection: databaseConnection,
	}
}

func (repository Repository) CountActiveShoes() (int64, error) {
	var totalCount int64
	countResult := repository.databaseConnection.Model(&entityShoe.ShoeModel{}).Count(&totalCount)
	return totalCount, countResult.Error
}

func (repository Repository) CountTotalCustomers() (int64, error) {
	var totalCount int64
	countResult := repository.databaseConnection.Model(&entityCustomer.Customer{}).Count(&totalCount)
	return totalCount, countResult.Error
}

func (repository Repository) CountActiveValidLinks(currentTimestamp int64) (int64, error) {
	var totalCount int64
	countResult := repository.databaseConnection.Model(&entityLink.AccessLink{}).
		Where(`"isActive" = true AND "status" != 'INACTIVE' AND "status" != 'EXPIRED' AND ("expiresAt" = 0 OR "expiresAt" > ?) AND ("viewingExpiresAt" = 0 OR "viewingExpiresAt" > ?)`, currentTimestamp, currentTimestamp).
		Count(&totalCount)
	return totalCount, countResult.Error
}

func (repository Repository) CountAccessedLinksSince(sinceTimestamp int64) (int64, error) {
	var totalCount int64
	countResult := repository.databaseConnection.Model(&entityLink.AccessLink{}).
		Where(`"lastAccessedAt" >= ?`, sinceTimestamp).
		Count(&totalCount)
	return totalCount, countResult.Error
}

func (repository Repository) FindRecentLinks(limit int) ([]entityLink.AccessLink, error) {
	var linksList []entityLink.AccessLink
	findResult := repository.databaseConnection.Order(`"linkID" DESC`).Limit(limit).Find(&linksList)
	return linksList, findResult.Error
}

func (repository Repository) FindRecentActiveCustomers(limit int) ([]entityCustomer.Customer, error) {
	var customersList []entityCustomer.Customer
	findResult := repository.databaseConnection.Where(`"isActive" = true`).Order(`"ID" DESC`).Limit(limit).Find(&customersList)
	return customersList, findResult.Error
}
