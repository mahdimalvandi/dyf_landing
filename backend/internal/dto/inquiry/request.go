package inquiry

import "strings"

type CreateRequest struct {
	StoreName      string `json:"store_name" validate:"required,min=2,max=100"`
	CityMarket     string `json:"city_market" validate:"required,min=2,max=120"`
	PhoneNumber    string `json:"phone_number" validate:"required,iran_phone"`
	LinePreference string `json:"line_preference" validate:"required,oneof=both executive sneaker"`
	Source         string `json:"source" validate:"max=60"`
}

func (request *CreateRequest) Normalize() {
	request.StoreName = strings.TrimSpace(request.StoreName)
	request.CityMarket = strings.TrimSpace(request.CityMarket)
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
	if request.Source == "" {
		request.Source = "landing_page"
	}
}
