package link

import "strings"

func (request *CreateLinkRequest) Normalize() {
	request.RecipientName = strings.TrimSpace(request.RecipientName)
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
	request.AuthMethod = strings.ToUpper(strings.TrimSpace(request.AuthMethod))
	if request.AuthMethod == "" {
		request.AuthMethod = "DIRECT"
	}

	cleanedShoeIDs := make([]int64, 0, len(request.ShoeIDs))
	seenMap := make(map[int64]bool)
	for index := range request.ShoeIDs {
		targetID := request.ShoeIDs[index]
		if targetID > 0 && !seenMap[targetID] {
			seenMap[targetID] = true
			cleanedShoeIDs = append(cleanedShoeIDs, targetID)
		}
	}
	request.ShoeIDs = cleanedShoeIDs
}

func (request *UpdateLinkRequest) Normalize() {
	request.RecipientName = strings.TrimSpace(request.RecipientName)
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
	request.AuthMethod = strings.ToUpper(strings.TrimSpace(request.AuthMethod))
	if request.AuthMethod == "" {
		request.AuthMethod = "DIRECT"
	}

	cleanedShoeIDs := make([]int64, 0, len(request.ShoeIDs))
	seenMap := make(map[int64]bool)
	for index := range request.ShoeIDs {
		targetID := request.ShoeIDs[index]
		if targetID > 0 && !seenMap[targetID] {
			seenMap[targetID] = true
			cleanedShoeIDs = append(cleanedShoeIDs, targetID)
		}
	}
	request.ShoeIDs = cleanedShoeIDs
}

func (filter *ListLinksFilter) Normalize() {
	filter.Pagination.Normalize()
	filter.Search = strings.TrimSpace(filter.Search)
	filter.Status = strings.ToUpper(strings.TrimSpace(filter.Status))
}
