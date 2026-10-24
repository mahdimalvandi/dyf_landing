package errors_test

import (
	"testing"

	staticErrors "dyf-backend/statics/errors"
)

func TestTranslateToPersian_NewErrors(t *testing.T) {
	testCases := []struct {
		err          error
		expectedText string
	}{
		{
			err:          staticErrors.ErrNoActivePermission,
			expectedText: "مجوز دسترسی فعالی برای این حساب یافت نشد",
		},
		{
			err:          staticErrors.ErrPhoneNotAuthorized,
			expectedText: "شماره همراه وارد شده برای این پیوند مجاز نمی‌باشد",
		},
		{
			err:          staticErrors.ErrLinkExpired,
			expectedText: "مهلت زمانی این لینک به پایان رسیده است",
		},
		{
			err:          staticErrors.ErrInvalidOTP,
			expectedText: "کد تایید وارد شده نادرست است",
		},
	}

	for _, tc := range testCases {
		translation := staticErrors.TranslateToPersian(tc.err)
		if translation != tc.expectedText {
			t.Fatalf("for error %v, expected %q, got %q", tc.err, tc.expectedText, translation)
		}
	}
}
