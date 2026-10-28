package middleware

import (
	"dyf-backend/pkg/response"
	staticErrors "dyf-backend/statics/errors"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"time"
)

func RateLimit(max int) fiber.Handler {
	return limiter.New(limiter.Config{
		Max: max, Expiration: time.Minute,
		LimitReached: func(c fiber.Ctx) error {
			return response.FromError(c, fiber.StatusTooManyRequests, staticErrors.ErrTooManyRequests, nil)
		},
	})
}
