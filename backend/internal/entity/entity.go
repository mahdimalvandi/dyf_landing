package entity

import "time"

type BaseEntity struct {
	ID int64 `gorm:"column:ID" json:"ID"`
}

func GenerateNanosecondID() int64 {
	return time.Now().UnixNano()
}

func CurrentUnixTimestamp() int64 {
	return time.Now().Unix()
}
