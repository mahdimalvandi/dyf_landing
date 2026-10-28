package media

import (
	"net/url"
	"testing"
	"time"
)

func TestSignedURLs(t *testing.T) {
	if err := Configure("test-secret-at-least-thirty-two-bytes"); err != nil {
		t.Fatal(err)
	}
	signed, _ := url.Parse(SignURL("/uploads/shoes/shoe.webp", time.Now().Add(time.Minute).Unix(), "123"))
	q := signed.Query()
	if !Verify("shoe.webp", q.Get("e"), q.Get("g"), q.Get("s")) {
		t.Fatal("valid URL rejected")
	}
	for _, item := range []struct{ name, expires, grant, sig string }{
		{"other.webp", q.Get("e"), "123", q.Get("s")},
		{"shoe.webp", q.Get("e"), "124", q.Get("s")},
		{"shoe.webp", "0", "123", q.Get("s")},
		{"../shoe.webp", q.Get("e"), "123", q.Get("s")},
		{"shoe.webp", q.Get("e"), "123", ""},
	} {
		if Verify(item.name, item.expires, item.grant, item.sig) {
			t.Fatalf("accepted invalid signature: %+v", item)
		}
	}
	expired, _ := url.Parse(SignURL("/uploads/shoes/shoe.webp", time.Now().Add(-time.Minute).Unix(), ""))
	if Verify("shoe.webp", expired.Query().Get("e"), "", expired.Query().Get("s")) {
		t.Fatal("expired URL accepted")
	}
	if got := SignURL("/assets/images/logo.png", 0, ""); got != "/assets/images/logo.png" {
		t.Fatal(got)
	}
	if got := SignURL("/uploads/shoes/../secret", 0, ""); got != "" {
		t.Fatal("unsafe path accepted")
	}
}

func TestValidFilenameRejectsDirectoryNames(t *testing.T) {
	for _, name := range []string{"", ".", "..", "../secret", "nested/file.webp", "nested\\file.webp"} {
		if ValidFilename(name) {
			t.Fatalf("accepted unsafe filename %q", name)
		}
	}
}
