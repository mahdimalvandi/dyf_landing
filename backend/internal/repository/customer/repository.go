package customer

import (
	"errors"

	entityCustomer "dyf-backend/internal/entity/customer"
	"dyf-backend/pkg/pagination"

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

func (repository Repository) CreateCustomer(customerRecord entityCustomer.Customer) (entityCustomer.Customer, error) {
	createResult := repository.databaseConnection.Create(&customerRecord)
	if createResult.Error != nil {
		return entityCustomer.Customer{}, createResult.Error
	}
	return customerRecord, nil
}

func (repository Repository) FindCustomerByID(customerID int64) (entityCustomer.Customer, bool, error) {
	var customerRecord entityCustomer.Customer
	findResult := repository.databaseConnection.Where(`"ID" = ?`, customerID).First(&customerRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityCustomer.Customer{}, false, nil
		}
		return entityCustomer.Customer{}, false, findResult.Error
	}
	return customerRecord, true, nil
}

func (repository Repository) FindCustomerByPhone(phoneNumber string) (entityCustomer.Customer, bool, error) {
	var customerRecord entityCustomer.Customer
	findResult := repository.databaseConnection.Where(`"phoneNumber" = ?`, phoneNumber).First(&customerRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityCustomer.Customer{}, false, nil
		}
		return entityCustomer.Customer{}, false, findResult.Error
	}
	return customerRecord, true, nil
}

func (repository Repository) UpdateCustomer(customerRecord entityCustomer.Customer) error {
	saveResult := repository.databaseConnection.Save(&customerRecord)
	return saveResult.Error
}

func (repository Repository) UpdateCustomerStatus(customerID int64, isActive bool) error {
	updateResult := repository.databaseConnection.Model(&entityCustomer.Customer{}).Where(`"ID" = ?`, customerID).Update("isActive", isActive)
	return updateResult.Error
}

func (repository Repository) DeleteCustomer(customerID int64) error {
	deleteResult := repository.databaseConnection.Where(`"ID" = ?`, customerID).Delete(&entityCustomer.Customer{})
	return deleteResult.Error
}

func (repository Repository) ListCustomers(searchTerm string, statusFilter string, paginationScope pagination.Pagination) ([]entityCustomer.Customer, int64, error) {
	baseQuery := repository.databaseConnection.Model(&entityCustomer.Customer{})

	if statusFilter == "active" {
		baseQuery = baseQuery.Where(`"isActive" = ?`, true)
	} else if statusFilter == "inactive" {
		baseQuery = baseQuery.Where(`"isActive" = ?`, false)
	}

	if searchTerm != "" {
		likePattern := "%" + searchTerm + "%"
		baseQuery = baseQuery.Where(
			`"firstNameFa" ILIKE ? OR "lastNameFa" ILIKE ? OR "firstNameEn" ILIKE ? OR "lastNameEn" ILIKE ? OR "storeName" ILIKE ? OR "phoneNumber" ILIKE ?`,
			likePattern, likePattern, likePattern, likePattern, likePattern, likePattern,
		)
	}

	var totalCount int64
	if countError := baseQuery.Count(&totalCount).Error; countError != nil {
		return nil, 0, countError
	}

	var customersList []entityCustomer.Customer
	findResult := baseQuery.Scopes(paginationScope.GetScope()).Order(`"ID" DESC`).Find(&customersList)
	if findResult.Error != nil {
		return nil, 0, findResult.Error
	}

	return customersList, totalCount, nil
}
