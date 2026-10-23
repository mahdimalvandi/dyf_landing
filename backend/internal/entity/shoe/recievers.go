package shoe

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

func (ShoeModel) TableName() string {
	return "shoeModels"
}

func (list StringList) Value() (driver.Value, error) {
	if list == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(list)
}

func (list *StringList) Scan(sourceValue any) error {
	if sourceValue == nil {
		*list = []string{}
		return nil
	}
	sourceBytes, isByteSlice := sourceValue.([]byte)
	if !isByteSlice {
		sourceString, isString := sourceValue.(string)
		if !isString {
			return errors.New("invalid type for StringList")
		}
		sourceBytes = []byte(sourceString)
	}
	return json.Unmarshal(sourceBytes, list)
}

func (list IntList) Value() (driver.Value, error) {
	if list == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(list)
}

func (list *IntList) Scan(sourceValue any) error {
	if sourceValue == nil {
		*list = []int{}
		return nil
	}
	sourceBytes, isByteSlice := sourceValue.([]byte)
	if !isByteSlice {
		sourceString, isString := sourceValue.(string)
		if !isString {
			return errors.New("invalid type for IntList")
		}
		sourceBytes = []byte(sourceString)
	}
	return json.Unmarshal(sourceBytes, list)
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
