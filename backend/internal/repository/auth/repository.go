package auth

import (
	"errors"

	entityAuth "dyf-backend/internal/entity/auth"
	constantsAuth "dyf-backend/statics/constants/auth"

	"gorm.io/gorm"
)

type Repository struct {
	databaseConnection *gorm.DB
}

func NewRepository(databaseConnection *gorm.DB) Repository {
	return Repository{
		databaseConnection: databaseConnection,
	}
}

func (repository Repository) FindAdminByPhoneNumber(phoneNumber string) (entityAuth.AdminUser, bool, error) {
	var adminUser entityAuth.AdminUser
	findResult := repository.databaseConnection.Where(`"phoneNumber" = ?`, phoneNumber).First(&adminUser)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityAuth.AdminUser{}, false, nil
		}
		return entityAuth.AdminUser{}, false, findResult.Error
	}
	return adminUser, true, nil
}

func (repository Repository) FindAdminByID(adminID int64) (entityAuth.AdminUser, bool, error) {
	var adminUser entityAuth.AdminUser
	findResult := repository.databaseConnection.Where(`"ID" = ?`, adminID).First(&adminUser)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityAuth.AdminUser{}, false, nil
		}
		return entityAuth.AdminUser{}, false, findResult.Error
	}
	return adminUser, true, nil
}

func (repository Repository) FindLatestActiveOTP(phoneNumber, purpose string) (entityAuth.OTPVerification, bool, error) {
	var otpRecord entityAuth.OTPVerification
	findResult := repository.databaseConnection.
		Where(`"phoneNumber" = ? AND "purpose" = ? AND "isUsed" = false`, phoneNumber, purpose).
		Order(`"ID" DESC`).
		First(&otpRecord)

	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityAuth.OTPVerification{}, false, nil
		}
		return entityAuth.OTPVerification{}, false, findResult.Error
	}
	return otpRecord, true, nil
}

func (repository Repository) CountRecentOTPRequests(phoneNumber, purpose string, sinceUnixTimestamp int64) (int64, error) {
	var requestCount int64
	countResult := repository.databaseConnection.Model(&entityAuth.OTPVerification{}).
		Where(`"phoneNumber" = ? AND "purpose" = ? AND "ID" >= ?`, phoneNumber, purpose, sinceUnixTimestamp).
		Count(&requestCount)

	if countResult.Error != nil {
		return 0, countResult.Error
	}
	return requestCount, nil
}

func (repository Repository) InvalidatePreviousOTPs(phoneNumber, purpose string) error {
	updateResult := repository.databaseConnection.Model(&entityAuth.OTPVerification{}).
		Where(`"phoneNumber" = ? AND "purpose" = ? AND "isUsed" = false`, phoneNumber, purpose).
		Update("isUsed", true)

	return updateResult.Error
}

func (repository Repository) CreateOTP(otpRecord entityAuth.OTPVerification) error {
	createResult := repository.databaseConnection.Create(&otpRecord)
	return createResult.Error
}

func (repository Repository) MarkOTPAsUsed(otpID int64) error {
	updateResult := repository.databaseConnection.Model(&entityAuth.OTPVerification{}).
		Where(`"ID" = ?`, otpID).
		Update("isUsed", true)

	return updateResult.Error
}

func (repository Repository) IncrementOTPAttempts(otpID int64) error {
	updateResult := repository.databaseConnection.Model(&entityAuth.OTPVerification{}).
		Where(`"ID" = ?`, otpID).
		UpdateColumn("attempts", gorm.Expr(`"attempts" + 1`))

	return updateResult.Error
}

func (repository Repository) CreateDevice(deviceRecord entityAuth.Device) error {
	createResult := repository.databaseConnection.Create(&deviceRecord)
	return createResult.Error
}

func (repository Repository) FindDeviceByTokenHash(tokenHash string) (entityAuth.Device, bool, error) {
	var deviceRecord entityAuth.Device
	findResult := repository.databaseConnection.Where(`"tokenHash" = ?`, tokenHash).First(&deviceRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityAuth.Device{}, false, nil
		}
		return entityAuth.Device{}, false, findResult.Error
	}
	return deviceRecord, true, nil
}

func (repository Repository) UpdateDeviceStatus(deviceID int64, newStatus string) error {
	updateResult := repository.databaseConnection.Model(&entityAuth.Device{}).
		Where(`"ID" = ?`, deviceID).
		Update("status", newStatus)

	return updateResult.Error
}

func (repository Repository) DeactivateDeviceByTokenHash(tokenHash string) error {
	updateResult := repository.databaseConnection.Model(&entityAuth.Device{}).
		Where(`"tokenHash" = ?`, tokenHash).
		Update("status", constantsAuth.DeviceStatusInactive)

	return updateResult.Error
}
