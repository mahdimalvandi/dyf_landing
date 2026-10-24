package middleware

import (
	"crypto/md5"
	"encoding/hex"
	"strings"
	"time"

	repoAuth "dyf-backend/internal/repository/auth"
	"dyf-backend/pkg/response"
	constantsAuth "dyf-backend/statics/constants/auth"
	staticErrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func RequireAdminAuth(authRepository repoAuth.Repository) fiber.Handler {
	return func(fiberContext fiber.Ctx) error {
		authorizationHeader := fiberContext.Get("Authorization")
		if authorizationHeader == "" {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
		}

		headerParts := strings.SplitN(authorizationHeader, " ", 2)
		if len(headerParts) != 2 || strings.ToLower(headerParts[0]) != "bearer" {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
		}

		rawToken := strings.TrimSpace(headerParts[1])
		if rawToken == "" {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
		}

		md5Hasher := md5.New()
		md5Hasher.Write([]byte(rawToken))
		tokenHash := hex.EncodeToString(md5Hasher.Sum(nil))

		deviceRecord, found, findError := authRepository.FindDeviceByTokenHash(tokenHash)
		if findError != nil || !found {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
		}

		if deviceRecord.Status != constantsAuth.DeviceStatusActive {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
		}

		currentTime := time.Now().Unix()
		if currentTime > deviceRecord.ExpiresAt {
			_ = authRepository.UpdateDeviceStatus(deviceRecord.ID, constantsAuth.DeviceStatusExpired)
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticErrors.ErrUnauthorized, nil)
		}

		if deviceRecord.UserType != constantsAuth.UserTypeAdmin {
			return response.FromError(fiberContext, fiber.StatusForbidden, staticErrors.ErrForbidden, nil)
		}

		fiberContext.Locals("userID", deviceRecord.UserID)
		fiberContext.Locals("userType", deviceRecord.UserType)
		fiberContext.Locals("tokenHash", deviceRecord.TokenHash)
		fiberContext.Locals("deviceID", deviceRecord.ID)

		return fiberContext.Next()
	}
}
