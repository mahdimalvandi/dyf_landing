package shoe

import (
	"errors"
	"fmt"
	"strconv"

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

func (repository Repository) CreateShoe(shoeRecord entityShoe.ShoeModel) (entityShoe.ShoeModel, error) {
	createResult := repository.databaseConnection.Create(&shoeRecord)
	if createResult.Error != nil {
		return entityShoe.ShoeModel{}, createResult.Error
	}
	return shoeRecord, nil
}

func (repository Repository) FindShoeByID(shoeID int64) (entityShoe.ShoeModel, bool, error) {
	var shoeRecord entityShoe.ShoeModel
	findResult := repository.databaseConnection.Where(`"ID" = ?`, shoeID).First(&shoeRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityShoe.ShoeModel{}, false, nil
		}
		return entityShoe.ShoeModel{}, false, findResult.Error
	}
	return shoeRecord, true, nil
}

func (repository Repository) FindShoeByModelID(modelID int64) (entityShoe.ShoeModel, bool, error) {
	var shoeRecord entityShoe.ShoeModel
	findResult := repository.databaseConnection.Where(`"modelID" = ?`, modelID).First(&shoeRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityShoe.ShoeModel{}, false, nil
		}
		return entityShoe.ShoeModel{}, false, findResult.Error
	}
	return shoeRecord, true, nil
}

func (repository Repository) FindShoeByIDOrModelID(lookupIdentifier int64) (entityShoe.ShoeModel, bool, error) {
	var shoeRecord entityShoe.ShoeModel
	findResult := repository.databaseConnection.Where(`"ID" = ? OR "modelID" = ?`, lookupIdentifier, lookupIdentifier).First(&shoeRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityShoe.ShoeModel{}, false, nil
		}
		return entityShoe.ShoeModel{}, false, findResult.Error
	}
	return shoeRecord, true, nil
}

func (repository Repository) UpdateShoe(shoeRecord entityShoe.ShoeModel) error {
	saveResult := repository.databaseConnection.Save(&shoeRecord)
	return saveResult.Error
}

func (repository Repository) DeleteShoe(shoeID int64) error {
	deleteResult := repository.databaseConnection.Where(`"ID" = ?`, shoeID).Delete(&entityShoe.ShoeModel{})
	return deleteResult.Error
}

func (repository Repository) ListShoes(categoryID int64, searchTerm string, offset int, limit int) ([]entityShoe.ShoeModel, int64, error) {
	baseQuery := repository.databaseConnection.Model(&entityShoe.ShoeModel{})

	if categoryID > 0 {
		categoryJSONQuery := fmt.Sprintf("[%d]", categoryID)
		baseQuery = baseQuery.Where(`"categoryIDs" @> ?::jsonb`, categoryJSONQuery)
	}

	if searchTerm != "" {
		if numericModelID, parseError := strconv.ParseInt(searchTerm, 10, 64); parseError == nil {
			baseQuery = baseQuery.Where(`"shoeTitle" ILIKE ? OR "modelID" = ?`, "%"+searchTerm+"%", numericModelID)
		} else {
			baseQuery = baseQuery.Where(`"shoeTitle" ILIKE ?`, "%"+searchTerm+"%")
		}
	}

	var totalCount int64
	if countError := baseQuery.Count(&totalCount).Error; countError != nil {
		return nil, 0, countError
	}

	var shoesList []entityShoe.ShoeModel
	findResult := baseQuery.Order(`"modelID" ASC`).Offset(offset).Limit(limit).Find(&shoesList)
	if findResult.Error != nil {
		return nil, 0, findResult.Error
	}

	return shoesList, totalCount, nil
}
