package shoe

import "strings"

func (request *CreateShoeRequest) Normalize() {
	request.Title = strings.TrimSpace(request.Title)
	request.Description = strings.TrimSpace(request.Description)
	request.CoverImage = strings.TrimSpace(request.CoverImage)

	cleanedColors := make([]string, 0, len(request.Colors))
	for index := range request.Colors {
		trimmedColor := strings.TrimSpace(request.Colors[index])
		if trimmedColor != "" {
			cleanedColors = append(cleanedColors, trimmedColor)
		}
	}
	request.Colors = cleanedColors

	cleanedImages := make([]string, 0, len(request.Images))
	for index := range request.Images {
		trimmedImage := strings.TrimSpace(request.Images[index])
		if trimmedImage != "" {
			cleanedImages = append(cleanedImages, trimmedImage)
		}
	}
	request.Images = cleanedImages

	cleanedVideos := make([]string, 0, len(request.Videos))
	for index := range request.Videos {
		trimmedVideo := strings.TrimSpace(request.Videos[index])
		if trimmedVideo != "" {
			cleanedVideos = append(cleanedVideos, trimmedVideo)
		}
	}
	request.Videos = cleanedVideos
}

func (request *UpdateShoeRequest) Normalize() {
	request.Title = strings.TrimSpace(request.Title)
	request.Description = strings.TrimSpace(request.Description)
	request.CoverImage = strings.TrimSpace(request.CoverImage)

	cleanedColors := make([]string, 0, len(request.Colors))
	for index := range request.Colors {
		trimmedColor := strings.TrimSpace(request.Colors[index])
		if trimmedColor != "" {
			cleanedColors = append(cleanedColors, trimmedColor)
		}
	}
	request.Colors = cleanedColors

	cleanedImages := make([]string, 0, len(request.Images))
	for index := range request.Images {
		trimmedImage := strings.TrimSpace(request.Images[index])
		if trimmedImage != "" {
			cleanedImages = append(cleanedImages, trimmedImage)
		}
	}
	request.Images = cleanedImages

	cleanedVideos := make([]string, 0, len(request.Videos))
	for index := range request.Videos {
		trimmedVideo := strings.TrimSpace(request.Videos[index])
		if trimmedVideo != "" {
			cleanedVideos = append(cleanedVideos, trimmedVideo)
		}
	}
	request.Videos = cleanedVideos
}

func (request *SetCoverRequest) Normalize() {
	request.CoverImage = strings.TrimSpace(request.CoverImage)
}

func (request *RemoveMediaRequest) Normalize() {
	request.MediaURL = strings.TrimSpace(request.MediaURL)
}

func (filter *ListShoesFilter) Normalize() {
	filter.Pagination.Normalize()
	filter.Search = strings.TrimSpace(filter.Search)
}
