package category

type Category struct {
	ID    int64  `gorm:"column:ID" json:"ID"`
	Title string `gorm:"column:title" json:"title"`
}

func (Category) TableName() string {
	return "categories"
}
