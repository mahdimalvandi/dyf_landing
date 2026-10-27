package link

type AccessLink struct {
	IsDirectAccess         bool      `gorm:"column:isDirectAccess" json:"isDirectAccess"`
	ID                     int64     `gorm:"column:ID;primaryKey" json:"ID"`
	LinkID                 int64     `gorm:"column:linkID;autoIncrement" json:"linkID"`
	Token                  string    `gorm:"column:token;uniqueIndex" json:"token"`
	CustomerID             int64     `gorm:"column:customerID" json:"customerID"`
	RecipientName          string    `gorm:"column:recipientName" json:"recipientName"`
	PhoneNumber            string    `gorm:"column:phoneNumber" json:"phoneNumber"`
	AuthMethod             string    `gorm:"column:authMethod" json:"authMethod"`
	ShoeIDs                Int64List `gorm:"column:shoeIDs;type:jsonb" json:"shoeIDs"`
	ViewingDurationMinutes int       `gorm:"column:viewingDurationMinutes" json:"viewingDurationMinutes"`
	ExpiresAt              int64     `gorm:"column:expiresAt" json:"expiresAt"`
	FirstViewedAt          int64     `gorm:"column:firstViewedAt" json:"firstViewedAt"`
	ViewingExpiresAt       int64     `gorm:"column:viewingExpiresAt" json:"viewingExpiresAt"`
	IsActive               bool      `gorm:"column:isActive" json:"isActive"`
	Status                 string    `gorm:"column:status" json:"status"`
	LastAccessedAt         int64     `gorm:"column:lastAccessedAt" json:"lastAccessedAt"`
}

type Int64List []int64
