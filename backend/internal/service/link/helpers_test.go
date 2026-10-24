package link

import (
	"crypto/md5"
	"encoding/hex"
	"testing"
)

func TestGenerateNumericCode(t *testing.T) {
	for i := 0; i < 20; i++ {
		code, err := generateNumericCode(5)
		if err != nil {
			t.Fatalf("unexpected error generating code: %v", err)
		}
		if len(code) != 5 {
			t.Fatalf("expected length 5, got %d (%q)", len(code), code)
		}
		for _, ch := range code {
			if ch < '0' || ch > '9' {
				t.Fatalf("expected digit, got %c", ch)
			}
		}
	}
}

func TestGenerateSecureOpaqueToken(t *testing.T) {
	rawToken, tokenHash, err := generateSecureOpaqueToken()
	if err != nil {
		t.Fatalf("unexpected error generating token: %v", err)
	}

	if len(rawToken) != 64 {
		t.Fatalf("expected raw token length 64, got %d", len(rawToken))
	}
	if len(tokenHash) != 32 {
		t.Fatalf("expected token hash length 32, got %d", len(tokenHash))
	}

	hasher := md5.New()
	hasher.Write([]byte(rawToken))
	expectedHash := hex.EncodeToString(hasher.Sum(nil))

	if tokenHash != expectedHash {
		t.Fatalf("token hash mismatch: got %q, expected %q", tokenHash, expectedHash)
	}
}
