package repository

import "gorm.io/gorm"

type BaseRepository struct {
	DatabaseConnection *gorm.DB
}

func NewBaseRepository(databaseConnection *gorm.DB) BaseRepository {
	return BaseRepository{
		DatabaseConnection: databaseConnection,
	}
}
