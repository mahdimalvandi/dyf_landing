package repository

import "gorm.io/gorm"

// BaseRepository encapsulates shared GORM database operations
type BaseRepository struct {
	DB *gorm.DB
}

func NewBaseRepository(db *gorm.DB) *BaseRepository {
	return &BaseRepository{DB: db}
}
