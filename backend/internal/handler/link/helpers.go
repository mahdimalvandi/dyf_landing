package link

import (
	"strings"

	"github.com/gofiber/fiber/v3"
)

func extractSessionToken(fiberContext fiber.Ctx) string {
	authorizationHeader := strings.TrimSpace(fiberContext.Get("Authorization"))
	if authorizationHeader != "" {
		headerParts := strings.SplitN(authorizationHeader, " ", 2)
		if len(headerParts) == 2 && strings.EqualFold(headerParts[0], "bearer") {
			candidateToken := strings.TrimSpace(headerParts[1])
			if candidateToken != "" {
				return candidateToken
			}
		}
	}

	if catalogHeaderToken := strings.TrimSpace(fiberContext.Get("X-Catalog-Token")); catalogHeaderToken != "" {
		return catalogHeaderToken
	}

	if sessionHeaderToken := strings.TrimSpace(fiberContext.Get("X-Session-Token")); sessionHeaderToken != "" {
		return sessionHeaderToken
	}

	if querySessionToken := strings.TrimSpace(fiberContext.Query("sessionToken")); querySessionToken != "" {
		return querySessionToken
	}

	if cookieToken := strings.TrimSpace(fiberContext.Cookies("dyf_catalog_token")); cookieToken != "" {
		return cookieToken
	}

	return ""
}
