package middleware

import (
	"crypto/md5"
	"encoding/hex"
	"strings"
	"time"

	repoauth "dyf-backend/internal/repository/auth"
	"dyf-backend/pkg/response"
	constantsauth "dyf-backend/statics/constants/auth"
	staticerrors "dyf-backend/statics/errors"

	"github.com/gofiber/fiber/v3"
)

func RequireAdminAuth(authRepository repoauth.Repository) fiber.Handler {
	return func(fiberContext fiber.Ctx) error {
		authorizationHeader := fiberContext.Get("Authorization")
		if authorizationHeader == "" {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticerrors.ErrUnauthorized, nil)
		}

		headerParts := strings.SplitN(authorizationHeader, " ", 2)
		if len(headerParts) != 2 || strings.ToLower(headerParts[0]) != "bearer" {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticerrors.ErrUnauthorized, nil)
		}

		rawToken := strings.TrimSpace(headerParts[1])
		if rawToken == "" {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticerrors.ErrUnauthorized, nil)
		}

		md5Hasher := md5.New()
		md5Hasher.Write([]byte(rawToken))
		tokenHash := hex.EncodeToString(md5Hasher.Sum(nil))

		deviceRecord, found, findError := authRepository.FindDeviceByTokenHash(tokenHash)
		if findError != nil || !found {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticerrors.ErrUnauthorized, nil)
		}

		if deviceRecord.Status != constantsauth.DeviceStatusActive {
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticerrors.ErrUnauthorized, nil)
		}

		currentTime := time.Now().Unix()
		if currentTime > deviceRecord.ExpiresAt {
			_ = authRepository.UpdateDeviceStatus(deviceRecord.ID, constantsauth.DeviceStatusExpired)
			return response.FromError(fiberContext, fiber.StatusUnauthorized, staticerrors.ErrUnauthorized, nil)
		}

		if deviceRecord.UserType != constantsauth.UserTypeAdmin {
			return response.FromError(fiberContext, fiber.StatusForbidden, staticerrors.ErrForbidden, nil)
		}

		fiberContext.Locals("userID", deviceRecord.UserID)
		fiberContext.Locals("userType", deviceRecord.UserType)
		fiberContext.Locals("tokenHash", deviceRecord.TokenHash)
		fiberContext.Locals("deviceID", deviceRecord.ID)

		return fiberContext.Next()
	}
}
