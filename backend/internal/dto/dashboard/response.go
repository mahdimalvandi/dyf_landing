package dashboard

type DashboardResponse struct {
	Stats           DashboardStats       `json:"stats"`
	RecentLinks     []RecentLinkItem     `json:"recentLinks"`
	RecentCustomers []RecentCustomerItem `json:"recentCustomers"`
}

type DashboardStats struct {
	ActiveShoesCount    int64 `json:"activeShoesCount"`
	TotalCustomersCount int64 `json:"totalCustomersCount"`
	ActiveLinksCount    int64 `json:"activeLinksCount"`
	Last7DaysViewsCount int64 `json:"last7DaysViewsCount"`
}

type RecentLinkItem struct {
	ID                     int64  `json:"ID"`
	LinkID                 int64  `json:"linkID"`
	Token                  string `json:"token"`
	URL                    string `json:"url"`
	RecipientName          string `json:"recipientName"`
	PhoneNumber            string `json:"phoneNumber"`
	ShoesCount             int    `json:"shoesCount"`
	ViewingDurationMinutes int    `json:"viewingDurationMinutes"`
	ExpiresAt              int64  `json:"expiresAt"`
	FirstViewedAt          int64  `json:"firstViewedAt"`
	ViewingExpiresAt       int64  `json:"viewingExpiresAt"`
	LastAccessedAt         int64  `json:"lastAccessedAt"`
	IsActive               bool   `json:"isActive"`
	Status                 string `json:"status"`
}

type RecentCustomerItem struct {
	ID          int64  `json:"ID"`
	FirstNameFa string `json:"firstNameFa"`
	LastNameFa  string `json:"lastNameFa"`
	FirstNameEn string `json:"firstNameEn"`
	LastNameEn  string `json:"lastNameEn"`
	StoreName   string `json:"storeName"`
	PhoneNumber string `json:"phoneNumber"`
	IsActive    bool   `json:"isActive"`
}
