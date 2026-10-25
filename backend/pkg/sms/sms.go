package sms

import "dyf-backend/config"

type MessagePayload struct {
	Mobile           string
	Code             string
	TemplateID       int
	ExpiresInSeconds int
}

type Sender interface {
	SendOTP(payload MessagePayload) error
}

func NewSender() Sender {
	appConfig := config.Get()
	if appConfig.OTP.Provider == "msgway" {
		return NewMsgWaySender(appConfig.OTP.MsgWayAPIKey, appConfig.OTP.MsgWayTemplateID)
	}
	return NewMockSender()
}
