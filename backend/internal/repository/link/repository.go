package link

import (
	"errors"
	"strconv"

	entityLink "dyf-backend/internal/entity/link"
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

func (repository Repository) CreateLink(linkRecord entityLink.AccessLink) (entityLink.AccessLink, error) {
	createResult := repository.databaseConnection.Create(&linkRecord)
	if createResult.Error != nil {
		return entityLink.AccessLink{}, createResult.Error
	}
	return linkRecord, nil
}

func (repository Repository) FindLinkByID(linkID int64) (entityLink.AccessLink, bool, error) {
	var linkRecord entityLink.AccessLink
	findResult := repository.databaseConnection.Where(`"ID" = ?`, linkID).First(&linkRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityLink.AccessLink{}, false, nil
		}
		return entityLink.AccessLink{}, false, findResult.Error
	}
	return linkRecord, true, nil
}

func (repository Repository) FindLinkByLinkID(sequentialLinkID int64) (entityLink.AccessLink, bool, error) {
	var linkRecord entityLink.AccessLink
	findResult := repository.databaseConnection.Where(`"linkID" = ?`, sequentialLinkID).First(&linkRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityLink.AccessLink{}, false, nil
		}
		return entityLink.AccessLink{}, false, findResult.Error
	}
	return linkRecord, true, nil
}

func (repository Repository) FindLinkByIDOrLinkID(identifier int64) (entityLink.AccessLink, bool, error) {
	var linkRecord entityLink.AccessLink
	findResult := repository.databaseConnection.Where(`"ID" = ? OR "linkID" = ?`, identifier, identifier).First(&linkRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityLink.AccessLink{}, false, nil
		}
		return entityLink.AccessLink{}, false, findResult.Error
	}
	return linkRecord, true, nil
}

func (repository Repository) FindLinkByToken(token string) (entityLink.AccessLink, bool, error) {
	var linkRecord entityLink.AccessLink
	findResult := repository.databaseConnection.Where(`"token" = ?`, token).First(&linkRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityLink.AccessLink{}, false, nil
		}
		return entityLink.AccessLink{}, false, findResult.Error
	}
	return linkRecord, true, nil
}

func (repository Repository) UpdateLink(linkRecord entityLink.AccessLink) error {
	saveResult := repository.databaseConnection.Save(&linkRecord)
	return saveResult.Error
}

func (repository Repository) DeleteLink(linkID int64) error {
	deleteResult := repository.databaseConnection.Where(`"ID" = ?`, linkID).Delete(&entityLink.AccessLink{})
	return deleteResult.Error
}

func (repository Repository) ListLinks(searchTerm string, statusFilter string, customerID int64, paginationScope pagination.Pagination) ([]entityLink.AccessLink, int64, error) {
	baseQuery := repository.databaseConnection.Model(&entityLink.AccessLink{})

	if customerID > 0 {
		baseQuery = baseQuery.Where(`"customerID" = ?`, customerID)
	}

	if statusFilter != "" && statusFilter != "ALL" {
		baseQuery = baseQuery.Where(`"status" = ?`, statusFilter)
	}

	if searchTerm != "" {
		if numericLinkID, parseError := strconv.ParseInt(searchTerm, 10, 64); parseError == nil {
			baseQuery = baseQuery.Where(`"recipientName" ILIKE ? OR "phoneNumber" ILIKE ? OR "linkID" = ?`, "%"+searchTerm+"%", "%"+searchTerm+"%", numericLinkID)
		} else {
			baseQuery = baseQuery.Where(`"recipientName" ILIKE ? OR "phoneNumber" ILIKE ?`, "%"+searchTerm+"%", "%"+searchTerm+"%")
		}
	}

	var totalCount int64
	if countError := baseQuery.Count(&totalCount).Error; countError != nil {
		return nil, 0, countError
	}

	var linksList []entityLink.AccessLink
	findResult := baseQuery.Scopes(paginationScope.GetScope()).Order(`"linkID" DESC`).Find(&linksList)
	if findResult.Error != nil {
		return nil, 0, findResult.Error
	}

	return linksList, totalCount, nil
}

func (repository Repository) CountAccessedSince(timestamp int64) (int64, error) {
	var totalCount int64
	countResult := repository.databaseConnection.Model(&entityLink.AccessLink{}).Where(`"lastAccessedAt" >= ?`, timestamp).Count(&totalCount)
	return totalCount, countResult.Error
}

func (repository Repository) CountAllAccessed() (int64, error) {
	var totalCount int64
	countResult := repository.databaseConnection.Model(&entityLink.AccessLink{}).Where(`"lastAccessedAt" > 0`).Count(&totalCount)
	return totalCount, countResult.Error
}
