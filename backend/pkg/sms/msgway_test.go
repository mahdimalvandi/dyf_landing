package sms

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestMsgWaySendOTP(t *testing.T) {
	for _, tc := range []struct {
		name      string
		code      int
		body      string
		wantError bool
	}{
		{"accepted", 200, `{"status":"success","referenceID":"test"}`, false},
		{"provider failure on HTTP 200", 200, `{"status":"error","error":{"code":"invalid_key","message":"rejected"}}`, true},
		{"HTTP failure despite success body", 500, `{"status":"success"}`, true},
		{"missing status", 200, `{}`, true},
		{"invalid JSON", 502, `bad gateway`, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			sender := MsgWaySender{APIKey: "test-key", TemplateID: 7, HTTPClient: &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
				if r.URL.String() != "https://api.msgway.com/send" || r.Method != http.MethodPost || r.Header.Get("apiKey") != "test-key" {
					t.Fatal("incorrect provider request")
				}
				body, err := io.ReadAll(r.Body)
				if err != nil || !strings.Contains(string(body), `"templateID":7`) || !strings.Contains(string(body), `"code":"123456"`) {
					t.Fatal("incorrect OTP payload")
				}
				return &http.Response{StatusCode: tc.code, Body: io.NopCloser(strings.NewReader(tc.body)), Header: make(http.Header)}, nil
			})}}
			err := sender.SendOTP(MessagePayload{Mobile: "09120000000", Code: "123456", ExpiresInSeconds: 120})
			if (err != nil) != tc.wantError {
				t.Fatalf("SendOTP error = %v, wantError = %v", err, tc.wantError)
			}
		})
	}
}
