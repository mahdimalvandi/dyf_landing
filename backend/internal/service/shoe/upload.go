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
	constantsShoe "dyf-backend/statics/constants/shoe"
	staticErrors "dyf-backend/statics/errors"
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
		if fileHeader.Size > constantsShoe.MaxVideoSizeInBytes {
			return dtoShoe.UploadMediaResponse{}, http.StatusBadRequest, staticErrors.ErrMediaSizeExceeded
		}
	} else {
		if fileHeader.Size > constantsShoe.MaxImageSizeInBytes {
			return dtoShoe.UploadMediaResponse{}, http.StatusBadRequest, staticErrors.ErrMediaSizeExceeded
		}
	}

	openedFile, openError := fileHeader.Open()
	if openError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}
	defer openedFile.Close()

	if mkdirError := os.MkdirAll(constantsShoe.UploadDirectory, 0755); mkdirError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}

	generatedFileName := fmt.Sprintf("%d_%04d%s", time.Now().UnixNano(), rand.Intn(10000), fileExtension)
	destinationPath := filepath.Join(constantsShoe.UploadDirectory, generatedFileName)

	destinationFile, createError := os.Create(destinationPath)
	if createError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}
	defer destinationFile.Close()

	if _, copyError := io.Copy(destinationFile, openedFile); copyError != nil {
		return dtoShoe.UploadMediaResponse{}, http.StatusInternalServerError, staticErrors.ErrUploadFailed
	}

	publicURL := fmt.Sprintf("%s/%s", constantsShoe.UploadPublicURLPrefix, generatedFileName)

	return dtoShoe.UploadMediaResponse{
		URL:      publicURL,
		FileType: detectedFileType,
		FileSize: fileHeader.Size,
	}, http.StatusOK, nil
}
