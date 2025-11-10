package handlers

import (
	"context"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/customer"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// CustomersHandler handles customer-related requests
type CustomersHandler struct {
	db *ent.Client
}

// NewCustomersHandler creates a new customers handler
func NewCustomersHandler(db *ent.Client) *CustomersHandler {
	return &CustomersHandler{db: db}
}

// List returns all customers for the tenant
func (h *CustomersHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	customers, err := h.db.Customer.
		Query().
		Where(customer.TenantID(tenantID)).
		Order(ent.Desc(customer.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch customers",
		})
	}

	return c.JSON(fiber.Map{
		"data": customers,
		"meta": fiber.Map{
			"total": len(customers),
		},
	})
}

// Get returns a single customer by ID
func (h *CustomersHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	customerID := c.Params("id")
	ctx := context.Background()

	cust, err := h.db.Customer.
		Query().
		Where(
			customer.And(
				customer.TenantID(tenantID),
				customer.ID(customerID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Customer not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch customer",
		})
	}

	return c.JSON(fiber.Map{
		"data": cust,
	})
}
