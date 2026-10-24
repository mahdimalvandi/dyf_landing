package sms

import "log"

type MockSender struct{}

func NewMockSender() Sender {
	return MockSender{}
}

func (mockSender MockSender) SendOTP(payload MessagePayload) error {
	log.Printf("[MOCK SMS] sent OTP code '%s' to mobile '%s' (expires in %d sec)", payload.Code, payload.Mobile, payload.ExpiresInSeconds)
	return nil
}
