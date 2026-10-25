package auth

type AdminUser struct {
	ID          int64  `gorm:"column:ID" json:"ID"`
	FirstName   string `gorm:"column:firstName" json:"firstName"`
	LastName    string `gorm:"column:lastName" json:"lastName"`
	PhoneNumber string `gorm:"column:phoneNumber" json:"phoneNumber"`
	IsActive    bool   `gorm:"column:isActive" json:"isActive"`
}

func (AdminUser) TableName() string {
	return "adminUsers"
}

type OTPVerification struct {
	ID          int64  `gorm:"column:ID" json:"ID"`
	PhoneNumber string `gorm:"column:phoneNumber" json:"phoneNumber"`
	Code        string `gorm:"column:code" json:"code"`
	Purpose     string `gorm:"column:purpose" json:"purpose"`
	ExpiresAt   int64  `gorm:"column:expiresAt" json:"expiresAt"`
	IsUsed      bool   `gorm:"column:isUsed" json:"isUsed"`
}

func (OTPVerification) TableName() string {
	return "otpVerifications"
}

type Device struct {
	ID        int64  `gorm:"column:ID" json:"ID"`
	UserID    int64  `gorm:"column:userID" json:"userID"`
	UserType  string `gorm:"column:userType" json:"userType"`
	TokenHash string `gorm:"column:tokenHash" json:"tokenHash"`
	ExpiresAt int64  `gorm:"column:expiresAt" json:"expiresAt"`
	Status    string `gorm:"column:status" json:"status"`
}

func (Device) TableName() string {
	return "devices"
}
