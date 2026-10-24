package sms

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	jsonIter "github.com/json-iterator/go"
)

type MsgWaySender struct {
	APIKey     string
	TemplateID int
	HTTPClient *http.Client
}

type msgWayRequestBody struct {
	Mobile     string `json:"mobile"`
	Method     string `json:"method"`
	TemplateID int    `json:"templateID"`
	Code       string `json:"code,omitempty"`
	ExpireTime int    `json:"expireTime,omitempty"`
}

type msgWayResponseBody struct {
	Status      string `json:"status"`
	ReferenceID string `json:"referenceID,omitempty"`
	Error       struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func NewMsgWaySender(apiKey string, templateID int) Sender {
	return MsgWaySender{
		APIKey:     apiKey,
		TemplateID: templateID,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (msgWay MsgWaySender) SendOTP(payload MessagePayload) error {
	fastJSON := jsonIter.ConfigCompatibleWithStandardLibrary

	targetTemplateID := payload.TemplateID
	if targetTemplateID <= 0 {
		targetTemplateID = msgWay.TemplateID
	}

	requestPayload := msgWayRequestBody{
		Mobile:     payload.Mobile,
		Method:     "sms",
		TemplateID: targetTemplateID,
		Code:       payload.Code,
		ExpireTime: payload.ExpiresInSeconds,
	}

	serializedBody, marshalError := fastJSON.Marshal(requestPayload)
	if marshalError != nil {
		return fmt.Errorf("failed marshaling msgway payload: %w", marshalError)
	}

	httpRequest, requestError := http.NewRequest(http.MethodPost, "https://api.msgway.com/send", bytes.NewBuffer(serializedBody))
	if requestError != nil {
		return fmt.Errorf("failed creating msgway http request: %w", requestError)
	}

	httpRequest.Header.Set("Content-Type", "application/json")
	httpRequest.Header.Set("apiKey", msgWay.APIKey)
	httpRequest.Header.Set("accept-language", "fa")

	httpResponse, executeError := msgWay.HTTPClient.Do(httpRequest)
	if executeError != nil {
		return fmt.Errorf("msgway request failed: %w", executeError)
	}
	defer httpResponse.Body.Close()

	responseBytes, readError := io.ReadAll(httpResponse.Body)
	if readError != nil {
		return fmt.Errorf("failed reading msgway response: %w", readError)
	}

	var parsedResponse msgWayResponseBody
	if unmarshalError := fastJSON.Unmarshal(responseBytes, &parsedResponse); unmarshalError != nil {
		return fmt.Errorf("failed parsing msgway response: %w", unmarshalError)
	}

	if parsedResponse.Status != "success" && httpResponse.StatusCode >= 400 {
		return fmt.Errorf("msgway returned error code %s: %s", parsedResponse.Error.Code, parsedResponse.Error.Message)
	}

	return nil
}
