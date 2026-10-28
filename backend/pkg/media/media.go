// Package media signs local upload URLs. Original paths remain in the database.
package media

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	constantsShoe "dyf-backend/statics/constants/shoe"
	"encoding/hex"
	"fmt"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"
)

var signingKey []byte

func Configure(secret string) error {
	if secret != "" {
		signingKey = []byte(secret)
		return nil
	}
	signingKey = make([]byte, 32)
	_, err := rand.Read(signingKey)
	return err
}

func signature(filename, expires, grant string) string {
	mac := hmac.New(sha256.New, signingKey)
	fmt.Fprintf(mac, "%s\n%s\n%s", filename, expires, grant)
	return hex.EncodeToString(mac.Sum(nil))
}

func SignURL(raw string, expiresAt int64, grant string) string {
	parsed, err := url.Parse(raw)
	if err != nil || parsed.IsAbs() || !strings.HasPrefix(parsed.Path, constantsShoe.UploadPublicURLPrefix+"/") {
		return raw
	}
	filename := strings.TrimPrefix(parsed.Path, constantsShoe.UploadPublicURLPrefix+"/")
	if !ValidFilename(filename) {
		return ""
	}
	expires := strconv.FormatInt(expiresAt, 10)
	query := url.Values{"e": {expires}, "g": {grant}, "s": {signature(filename, expires, grant)}}
	return constantsShoe.UploadPublicURLPrefix + "/" + url.PathEscape(filename) + "?" + query.Encode()
}

func SignURLs(raw []string, expiresAt int64, grant string) []string {
	result := make([]string, len(raw))
	for i, value := range raw {
		result[i] = SignURL(value, expiresAt, grant)
	}
	return result
}

func ValidFilename(filename string) bool {
	return filename != "" && filename != "." && filename != ".." && path.Base(filename) == filename && !strings.ContainsAny(filename, "\\\x00\r\n")
}

func Verify(filename, expires, grant, supplied string) bool {
	if len(signingKey) == 0 || !ValidFilename(filename) {
		return false
	}
	deadline, err := strconv.ParseInt(expires, 10, 64)
	if err != nil || deadline <= time.Now().Unix() {
		return false
	}
	expected, _ := hex.DecodeString(signature(filename, expires, grant))
	actual, err := hex.DecodeString(supplied)
	return err == nil && hmac.Equal(expected, actual)
}
