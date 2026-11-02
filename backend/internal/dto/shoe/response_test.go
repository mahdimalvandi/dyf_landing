package shoe

import (
	"dyf-backend/pkg/media"
	"strings"
	"testing"
)

func TestMediaResponsesDoNotChangeStoredPaths(t *testing.T) {
	if err := media.Configure("test-secret-at-least-thirty-two-bytes"); err != nil {
		t.Fatal(err)
	}
	original := ShoeDetailResponse{ShoeItemResponse: ShoeItemResponse{
		CoverImage: "/uploads/shoes/test.webp", Images: []string{"/uploads/shoes/test.webp"}, Videos: []string{"/uploads/shoes/test.mp4"},
	}}
	prepared := original.PrepareResponse().(ShoeDetailResponse)
	if !strings.Contains(prepared.CoverImage, "?e=") || !strings.Contains(prepared.Videos[0], "&s=") {
		t.Fatal("media not signed")
	}
	if prepared.CoverImage != prepared.Images[0] {
		t.Fatal("cover and primary image must match")
	}
	if original.Images[0] != "/uploads/shoes/test.webp" {
		t.Fatal("stored data mutated")
	}
}
