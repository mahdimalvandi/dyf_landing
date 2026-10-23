package shoe

const (
	MsgShoeCreatedSuccessfully     = "مدل کفش با موفقیت ثبت شد"
	MsgShoeUpdatedSuccessfully     = "مدل کفش با موفقیت ویرایش شد"
	MsgShoeDeletedSuccessfully     = "مدل کفش با موفقیت حذف شد"
	MsgShoeFetchedSuccessfully     = "شناسنامه مدل کفش با موفقیت دریافت شد"
	MsgShoeListFetchedSuccessfully = "فهرست مدل‌های کفش با موفقیت دریافت شد"
	MsgMediaUploadedSuccessfully   = "فایل رسانه با موفقیت بارگذاری شد"
	MsgCoverUpdatedSuccessfully    = "تصویر کاور مدل با موفقیت به‌روزرسانی شد"
	MsgMediaRemovedSuccessfully    = "فایل رسانه با موفقیت از مدل حذف شد"

	UploadDirectory       = "./uploads/shoes"
	UploadPublicURLPrefix = "/uploads/shoes"
	MaxImageSizeInBytes   = 10 * 1024 * 1024
	MaxVideoSizeInBytes   = 50 * 1024 * 1024
)
