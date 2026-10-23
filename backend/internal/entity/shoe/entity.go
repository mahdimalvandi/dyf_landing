package shoe

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

type StringList []string

type IntList []int

type Int64List []int64
