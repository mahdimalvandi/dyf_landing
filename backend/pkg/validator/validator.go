package validator

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

var (
	validate       = validator.New()
	iranPhoneRegex = regexp.MustCompile(`^09[0-9]{9}$`)
)

func init() {
	// Custom validator for Iranian phone numbers: e.g. 09121234567
	_ = validate.RegisterValidation("iran_phone", func(fl validator.FieldLevel) bool {
		phone := fl.Field().String()
		return iranPhoneRegex.MatchString(phone)
	})
}

// ValidationErrorDetail represents a single field error
type ValidationErrorDetail struct {
	Field string `json:"field"`
	Issue string `json:"issue"`
}

// ValidateStruct validates a struct and returns formatted error details
func ValidateStruct(s interface{}) []ValidationErrorDetail {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	var issues []ValidationErrorDetail
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			fieldName := toLowerCamelCase(e.Field())
			issue := formatErrorMessage(e)
			issues = append(issues, ValidationErrorDetail{
				Field: fieldName,
				Issue: issue,
			})
		}
	} else {
		issues = append(issues, ValidationErrorDetail{
			Field: "body",
			Issue: err.Error(),
		})
	}

	return issues
}

func formatErrorMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return fmt.Sprintf("فیلد %s الزامی است", toLowerCamelCase(e.Field()))
	case "iran_phone":
		return "شماره تلفن باید ۱۱ رقم بوده و با ۰۹ شروع شود"
	case "min":
		return fmt.Sprintf("حداقل مقدار/طول مجاز %s است", e.Param())
	case "max":
		return fmt.Sprintf("حداکثر مقدار/طول مجاز %s است", e.Param())
	default:
		return fmt.Sprintf("مقدار فیلد %s معتبر نیست", toLowerCamelCase(e.Field()))
	}
}

func toLowerCamelCase(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}
