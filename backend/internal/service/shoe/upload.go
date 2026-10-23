package shoe

import (
	"fmt"
	"io"
	"math/rand"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	dtoShoe "dyf-backend/internal/dto/shoe"
	staticErrors "dyf-backend/statics/errors"
)

const (
	maxImageSizeInBytes = 10 * 1024 * 1024
	maxVideoSizeInBytes = 50 * 1024 * 1024
)

var allowedImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
}

var allowedVideoExtensions = map[string]bool{
	".mp4":  true,
	".mov":  true,
	".webm": true,
}

func (service Service) SaveUploadedFile(fileHeader *multipart.FileHeader) (dtoShoe.UploadMediaResponse, int, error) {
	fileExtension := strings.ToLower(filepath.Ext(fileHeader.Filename))
	isImage := allowedImageExtensions[fileExtension]
	isVideo := allowedVideoExtensions[fileExtension]

	if !isImage && !isVideo {
		return dtoShoe.UploadMediaResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidMediaFile
	}

	detectedFileType := "image"
	if isVideo {
		detectedFileType = "video"
		if fileHeader.Size > maxVideoSizeInBytes {
			return dtoShoe.UploadMediaResponse{}, http.StatusBadRequest, staticErrors.ErrMediaSizeExceeded
		}
	} else {
		if fileHeader.Size > maxImageSizeInBytes {
			return dtoShoe.UploadMediaResponse{}, http.StatusBadRequest, staticErrors.ErrMediaSizeExceeded
		}
	}

	openedFile, openError := fileHeader.Open()
	if openError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}
	defer openedFile.Close()

	uploadDirectory := filepath.Join(".", "uploads", "shoes")
	if mkdirError := os.MkdirAll(uploadDirectory, 0755); mkdirError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}

	generatedFileName := fmt.Sprintf("%d_%04d%s", time.Now().UnixNano(), rand.Intn(10000), fileExtension)
	destinationPath := filepath.Join(uploadDirectory, generatedFileName)

	destinationFile, createError := os.Create(destinationPath)
	if createError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}
	defer destinationFile.Close()

	if _, copyError := io.Copy(destinationFile, openedFile); copyError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}

	publicURL := fmt.Sprintf("/uploads/shoes/%s", generatedFileName)

	return dtoShoe.UploadMediaResponse{
		URL:      publicURL,
		FileType: detectedFileType,
		FileSize: fileHeader.Size,
	}, http.StatusOK, nil
}
