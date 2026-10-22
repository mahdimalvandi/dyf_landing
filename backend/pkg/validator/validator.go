package validator

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

var (
	structValidator = validator.New()
	iranPhoneRegex  = regexp.MustCompile(`^09[0-9]{9}$`)
)

func init() {
	_ = structValidator.RegisterValidation("iran_phone", func(fieldLevel validator.FieldLevel) bool {
		phoneNumber := fieldLevel.Field().String()
		return iranPhoneRegex.MatchString(phoneNumber)
	})
}

type ValidationErrorDetail struct {
	Field string `json:"field"`
	Issue string `json:"issue"`
}

func ValidateStruct(targetStruct interface{}) []ValidationErrorDetail {
	validationError := structValidator.Struct(targetStruct)
	if validationError == nil {
		return nil
	}

	var issues []ValidationErrorDetail
	if fieldErrors, isFieldErrors := validationError.(validator.ValidationErrors); isFieldErrors {
		for index := range fieldErrors {
			singleError := fieldErrors[index]
			fieldName := formatFieldName(singleError.Field())
			issueMessage := formatErrorMessage(singleError)
			issues = append(issues, ValidationErrorDetail{
				Field: fieldName,
				Issue: issueMessage,
			})
		}
	} else {
		issues = append(issues, ValidationErrorDetail{
			Field: "body",
			Issue: validationError.Error(),
		})
	}

	return issues
}

func formatErrorMessage(fieldError validator.FieldError) string {
	switch fieldError.Tag() {
	case "required":
		return fmt.Sprintf("فیلد %s الزامی است", formatFieldName(fieldError.Field()))
	case "iran_phone":
		return "شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ آغاز شود"
	case "min":
		return fmt.Sprintf("حداقل مقدار یا طول مجاز %s است", fieldError.Param())
	case "max":
		return fmt.Sprintf("حداکثر مقدار یا طول مجاز %s است", fieldError.Param())
	default:
		return fmt.Sprintf("مقدار فیلد %s نامعتبر است", formatFieldName(fieldError.Field()))
	}
}

func formatFieldName(rawFieldName string) string {
	if len(rawFieldName) == 0 {
		return rawFieldName
	}
	return strings.ToLower(rawFieldName[:1]) + rawFieldName[1:]
}
