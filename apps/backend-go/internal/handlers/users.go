package handlers

import (
	"context"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/user"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// UsersHandler handles user-related requests
type UsersHandler struct {
	db *ent.Client
}

// NewUsersHandler creates a new users handler
func NewUsersHandler(db *ent.Client) *UsersHandler {
	return &UsersHandler{db: db}
}

// List returns all users for the tenant
func (h *UsersHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	users, err := h.db.User.
		Query().
		Where(user.TenantID(tenantID)).
		Order(ent.Desc(user.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch users",
		})
	}

	// Remove sensitive fields
	sanitizedUsers := make([]fiber.Map, len(users))
	for i, u := range users {
		sanitizedUsers[i] = fiber.Map{
			"id":        u.ID,
			"email":     u.Email,
			"firstName": u.FirstName,
			"lastName":  u.LastName,
			"role":      u.Role,
			"tenantId":  u.TenantID,
			"createdAt": u.CreatedAt,
			"updatedAt": u.UpdatedAt,
		}
	}

	return c.JSON(fiber.Map{
		"data": sanitizedUsers,
		"meta": fiber.Map{
			"total": len(users),
		},
	})
}

// Get returns a single user by ID
func (h *UsersHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := c.Params("id")
	ctx := context.Background()

	foundUser, err := h.db.User.
		Query().
		Where(
			user.And(
				user.TenantID(tenantID),
				user.ID(userID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch user",
		})
	}

	// Remove sensitive fields
	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"id":        foundUser.ID,
			"email":     foundUser.Email,
			"firstName": foundUser.FirstName,
			"lastName":  foundUser.LastName,
			"role":      foundUser.Role,
			"tenantId":  foundUser.TenantID,
			"createdAt": foundUser.CreatedAt,
			"updatedAt": foundUser.UpdatedAt,
		},
	})
}
