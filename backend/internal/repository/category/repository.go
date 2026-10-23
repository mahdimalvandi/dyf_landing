package category

import (
	"errors"

	entityCategory "dyf-backend/internal/entity/category"

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

func (repository Repository) CreateCategory(categoryRecord entityCategory.Category) error {
	createResult := repository.databaseConnection.Create(&categoryRecord)
	return createResult.Error
}

func (repository Repository) FindCategoryByID(categoryID int64) (entityCategory.Category, bool, error) {
	var categoryRecord entityCategory.Category
	findResult := repository.databaseConnection.Where(`"ID" = ?`, categoryID).First(&categoryRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityCategory.Category{}, false, nil
		}
		return entityCategory.Category{}, false, findResult.Error
	}
	return categoryRecord, true, nil
}

func (repository Repository) FindCategoryByTitle(title string) (entityCategory.Category, bool, error) {
	var categoryRecord entityCategory.Category
	findResult := repository.databaseConnection.Where(`"title" = ?`, title).First(&categoryRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityCategory.Category{}, false, nil
		}
		return entityCategory.Category{}, false, findResult.Error
	}
	return categoryRecord, true, nil
}

func (repository Repository) ListCategories() ([]entityCategory.Category, error) {
	var categoriesList []entityCategory.Category
	findResult := repository.databaseConnection.Order(`"ID" ASC`).Find(&categoriesList)
	if findResult.Error != nil {
		return nil, findResult.Error
	}
	return categoriesList, nil
}

func (repository Repository) UpdateCategory(categoryID int64, newTitle string) error {
	updateResult := repository.databaseConnection.Model(&entityCategory.Category{}).
		Where(`"ID" = ?`, categoryID).
		Update("title", newTitle)

	return updateResult.Error
}

func (repository Repository) DeleteCategory(categoryID int64) error {
	deleteResult := repository.databaseConnection.Where(`"ID" = ?`, categoryID).Delete(&entityCategory.Category{})
	return deleteResult.Error
}
