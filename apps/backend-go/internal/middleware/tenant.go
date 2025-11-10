package middleware

import (
	"context"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/tenant"
	"github.com/gofiber/fiber/v2"
)

// TenantScoping middleware ensures all database queries are scoped to the user's tenant
func TenantScoping(db *ent.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tenantID := GetTenantID(c)
		if tenantID == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing tenant context",
			})
		}

		// Verify tenant exists and is active
		ctx := context.Background()
		tenantEntity, err := db.Tenant.
			Query().
			Where(tenant.ID(tenantID)).
			Only(ctx)

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid tenant",
			})
		}

		// Check tenant status
		if tenantEntity.Status != "ACTIVE" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Tenant is not active",
			})
		}

		// Store tenant entity in locals for easy access
		c.Locals("tenant", tenantEntity)

		return c.Next()
	}
}

// GetTenant retrieves the tenant entity from context
func GetTenant(c *fiber.Ctx) *ent.Tenant {
	if tenant, ok := c.Locals("tenant").(*ent.Tenant); ok {
		return tenant
	}
	return nil
}
