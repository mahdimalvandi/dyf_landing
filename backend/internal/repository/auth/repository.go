package auth

import (
	"errors"

	entityauth "dyf-backend/internal/entity/auth"
	constantsauth "dyf-backend/statics/constants/auth"

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

func (repository Repository) FindAdminByPhoneNumber(phoneNumber string) (entityauth.AdminUser, bool, error) {
	var adminUser entityauth.AdminUser
	findResult := repository.databaseConnection.Where(`"phoneNumber" = ?`, phoneNumber).First(&adminUser)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityauth.AdminUser{}, false, nil
		}
		return entityauth.AdminUser{}, false, findResult.Error
	}
	return adminUser, true, nil
}

func (repository Repository) FindAdminByID(adminID int64) (entityauth.AdminUser, bool, error) {
	var adminUser entityauth.AdminUser
	findResult := repository.databaseConnection.Where(`"ID" = ?`, adminID).First(&adminUser)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityauth.AdminUser{}, false, nil
		}
		return entityauth.AdminUser{}, false, findResult.Error
	}
	return adminUser, true, nil
}

func (repository Repository) FindLatestActiveOTP(phoneNumber, purpose string) (entityauth.OTPVerification, bool, error) {
	var otpRecord entityauth.OTPVerification
	findResult := repository.databaseConnection.
		Where(`"phoneNumber" = ? AND "purpose" = ? AND "isUsed" = false`, phoneNumber, purpose).
		Order(`"ID" DESC`).
		First(&otpRecord)

	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityauth.OTPVerification{}, false, nil
		}
		return entityauth.OTPVerification{}, false, findResult.Error
	}
	return otpRecord, true, nil
}

func (repository Repository) CountRecentOTPRequests(phoneNumber, purpose string, sinceUnixTimestamp int64) (int64, error) {
	var requestCount int64
	countResult := repository.databaseConnection.Model(&entityauth.OTPVerification{}).
		Where(`"phoneNumber" = ? AND "purpose" = ? AND "ID" >= ?`, phoneNumber, purpose, sinceUnixTimestamp).
		Count(&requestCount)

	if countResult.Error != nil {
		return 0, countResult.Error
	}
	return requestCount, nil
}

func (repository Repository) InvalidatePreviousOTPs(phoneNumber, purpose string) error {
	updateResult := repository.databaseConnection.Model(&entityauth.OTPVerification{}).
		Where(`"phoneNumber" = ? AND "purpose" = ? AND "isUsed" = false`, phoneNumber, purpose).
		Update("isUsed", true)

	return updateResult.Error
}

func (repository Repository) CreateOTP(otpRecord entityauth.OTPVerification) error {
	createResult := repository.databaseConnection.Create(&otpRecord)
	return createResult.Error
}

func (repository Repository) MarkOTPAsUsed(otpID int64) error {
	updateResult := repository.databaseConnection.Model(&entityauth.OTPVerification{}).
		Where(`"ID" = ?`, otpID).
		Update("isUsed", true)

	return updateResult.Error
}

func (repository Repository) CreateDevice(deviceRecord entityauth.Device) error {
	createResult := repository.databaseConnection.Create(&deviceRecord)
	return createResult.Error
}

func (repository Repository) FindDeviceByTokenHash(tokenHash string) (entityauth.Device, bool, error) {
	var deviceRecord entityauth.Device
	findResult := repository.databaseConnection.Where(`"tokenHash" = ?`, tokenHash).First(&deviceRecord)
	if findResult.Error != nil {
		if errors.Is(findResult.Error, gorm.ErrRecordNotFound) {
			return entityauth.Device{}, false, nil
		}
		return entityauth.Device{}, false, findResult.Error
	}
	return deviceRecord, true, nil
}

func (repository Repository) UpdateDeviceStatus(deviceID int64, newStatus string) error {
	updateResult := repository.databaseConnection.Model(&entityauth.Device{}).
		Where(`"ID" = ?`, deviceID).
		Update("status", newStatus)

	return updateResult.Error
}

func (repository Repository) DeactivateDeviceByTokenHash(tokenHash string) error {
	updateResult := repository.databaseConnection.Model(&entityauth.Device{}).
		Where(`"tokenHash" = ?`, tokenHash).
		Update("status", constantsauth.DeviceStatusInactive)

	return updateResult.Error
}
