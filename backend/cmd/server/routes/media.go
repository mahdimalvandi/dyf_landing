package routes

import (
	repoCustomer "dyf-backend/internal/repository/customer"
	repoLink "dyf-backend/internal/repository/link"
	"dyf-backend/pkg/media"
	constantsShoe "dyf-backend/statics/constants/shoe"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
	"path/filepath"
	"strconv"
	"time"
)

func RegisterMediaRoutes(app *fiber.App, db *gorm.DB) {
	app.Get(constantsShoe.UploadPublicURLPrefix+"/:filename", func(c fiber.Ctx) error {
		filename, grant := c.Params("filename"), c.Query("g")
		if !media.Verify(filename, c.Query("e"), grant, c.Query("s")) {
			return c.SendStatus(fiber.StatusForbidden)
		}
		if grant != "" {
			id, err := strconv.ParseInt(grant, 10, 64)
			if err != nil {
				return c.SendStatus(fiber.StatusForbidden)
			}
			record, found, err := repoLink.NewRepository(db).FindLinkByID(id)
			if err != nil {
				return c.SendStatus(fiber.StatusInternalServerError)
			}
			now := time.Now().Unix()
			if !found || !record.IsActive || (record.ExpiresAt > 0 && now >= record.ExpiresAt) || (record.ViewingExpiresAt > 0 && now >= record.ViewingExpiresAt) {
				return c.SendStatus(fiber.StatusForbidden)
			}
			if record.IsDirectAccess {
				customer, found, err := repoCustomer.NewRepository(db).FindCustomerByID(record.CustomerID)
				if err != nil {
					return c.SendStatus(fiber.StatusInternalServerError)
				}
				if !found || !customer.IsActive {
					return c.SendStatus(fiber.StatusForbidden)
				}
			}
		}
		return c.SendFile(filepath.Join(constantsShoe.UploadDirectory, filename))
	})
}
