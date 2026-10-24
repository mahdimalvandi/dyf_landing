package category

type Category struct {
	ID    int64  `gorm:"column:ID" json:"ID"`
	Title string `gorm:"column:title" json:"title"`
}

type CategoryWithCount struct {
	ID        int64  `gorm:"column:ID" json:"ID"`
	Title     string `gorm:"column:title" json:"title"`
	ShoeCount int64  `gorm:"column:shoeCount" json:"shoeCount"`
}

func (Category) TableName() string {
	return "categories"
}
