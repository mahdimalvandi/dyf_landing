package customer

type Customer struct {
	ID          int64  `gorm:"column:ID;primaryKey" json:"ID"`
	FirstNameFa string `gorm:"column:firstNameFa" json:"firstNameFa"`
	LastNameFa  string `gorm:"column:lastNameFa" json:"lastNameFa"`
	FirstNameEn string `gorm:"column:firstNameEn" json:"firstNameEn"`
	LastNameEn  string `gorm:"column:lastNameEn" json:"lastNameEn"`
	StoreName   string `gorm:"column:storeName" json:"storeName"`
	PhoneNumber string `gorm:"column:phoneNumber;uniqueIndex" json:"phoneNumber"`
	IsActive    bool   `gorm:"column:isActive" json:"isActive"`
}
