package link

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

func (AccessLink) TableName() string {
	return "accessLinks"
}

func (list Int64List) Value() (driver.Value, error) {
	if list == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(list)
}

func (list *Int64List) Scan(sourceValue any) error {
	if sourceValue == nil {
		*list = []int64{}
		return nil
	}
	sourceBytes, isByteSlice := sourceValue.([]byte)
	if !isByteSlice {
		sourceString, isString := sourceValue.(string)
		if !isString {
			return errors.New("invalid type for Int64List")
		}
		sourceBytes = []byte(sourceString)
	}
	return json.Unmarshal(sourceBytes, list)
}
