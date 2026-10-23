package shoe

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type StringList []string

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

type IntList []int

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

type Int64List []int64

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

type ShoeModel struct {
	ID          int64      `gorm:"column:ID;primaryKey" json:"ID"`
	ModelID     int64      `gorm:"column:modelID;autoIncrement" json:"modelID"`
	ShoeTitle   string     `gorm:"column:shoeTitle" json:"shoeTitle"`
	Description string     `gorm:"column:description" json:"description"`
	CoverImage  string     `gorm:"column:coverImage" json:"coverImage"`
	Colors      StringList `gorm:"column:colors;type:jsonb" json:"colors"`
	Sizes       IntList    `gorm:"column:sizes;type:jsonb" json:"sizes"`
	Images      StringList `gorm:"column:images;type:jsonb" json:"images"`
	Videos      StringList `gorm:"column:videos;type:jsonb" json:"videos"`
	CategoryIDs Int64List  `gorm:"column:categoryIDs;type:jsonb" json:"categoryIDs"`
}

func (ShoeModel) TableName() string {
	return "shoeModels"
}
