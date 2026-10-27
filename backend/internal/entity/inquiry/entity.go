package inquiry

type Inquiry struct {
	ID             int64  `gorm:"column:ID" json:"id,string"`
	StoreName      string `gorm:"column:store_name" json:"store_name"`
	CityMarket     string `gorm:"column:city_market" json:"city_market"`
	PhoneNumber    string `gorm:"column:phone_number" json:"phone_number"`
	LinePreference string `gorm:"column:line_preference" json:"line_preference"`
	Source         string `gorm:"column:source" json:"source"`
	Status         string `gorm:"column:status" json:"status"`
}

func (Inquiry) TableName() string { return "inquiries" }
