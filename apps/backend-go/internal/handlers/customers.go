package handlers

import (
	"context"
	"time"

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

// Create creates a new customer
func (h *CustomersHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		FirstName              string  `json:"firstName"`
		MiddleName             *string `json:"middleName"`
		LastName               string  `json:"lastName"`
		Suffix                 *string `json:"suffix"`
		Email                  *string `json:"email"`
		Phone                  *string `json:"phone"`
		PhoneSecondary         *string `json:"phoneSecondary"`
		Mobile                 *string `json:"mobile"`
		DateOfBirth            *string `json:"dateOfBirth"`
		LicenseNumber          *string `json:"licenseNumber"`
		LicenseState           *string `json:"licenseState"`
		LicenseExpiry          *string `json:"licenseExpiry"`
		SSN                    *string `json:"ssn"`
		AddressStreet          *string `json:"addressStreet"`
		AddressCity            *string `json:"addressCity"`
		AddressState           *string `json:"addressState"`
		AddressZip             *string `json:"addressZip"`
		AddressCountry         *string `json:"addressCountry"`
		County                 *string `json:"county"`
		PreferredContactMethod *string `json:"preferredContactMethod"`
		LeadSource             *string `json:"leadSource"`
		LeadStatus             *string `json:"leadStatus"`
		LeadScore              *int    `json:"leadScore"`
		CreditScore            *int    `json:"creditScore"`
		AssignedToUserID       *string `json:"assignedToUserId"`
		EmployerName           *string `json:"employerName"`
		EmployerPhone          *string `json:"employerPhone"`
		MonthlyIncome          *int    `json:"monthlyIncome"`
		HousingStatus          *string `json:"housingStatus"`
		MonthlyPayment         *int    `json:"monthlyPayment"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.FirstName == "" || req.LastName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "firstName and lastName are required",
		})
	}

	// Generate ID
	customerID := middleware.GenerateID()

	// Build create query
	createQuery := h.db.Customer.Create().
		SetID(customerID).
		SetTenantID(tenantID).
		SetFirstName(req.FirstName).
		SetLastName(req.LastName)

	// Set optional fields
	if req.MiddleName != nil {
		createQuery.SetNillableMiddleName(req.MiddleName)
	}
	if req.Suffix != nil {
		createQuery.SetNillableSuffix(req.Suffix)
	}
	if req.Email != nil {
		createQuery.SetNillableEmail(req.Email)
	}
	if req.Phone != nil {
		createQuery.SetNillablePhone(req.Phone)
	}
	if req.PhoneSecondary != nil {
		createQuery.SetNillablePhoneSecondary(req.PhoneSecondary)
	}
	if req.Mobile != nil {
		createQuery.SetNillableMobile(req.Mobile)
	}
	if req.LicenseNumber != nil {
		createQuery.SetNillableLicenseNumber(req.LicenseNumber)
	}
	if req.LicenseState != nil {
		createQuery.SetNillableLicenseState(req.LicenseState)
	}
	if req.SSN != nil {
		createQuery.SetNillableSsn(req.SSN)
	}
	if req.AddressStreet != nil {
		createQuery.SetNillableAddressStreet(req.AddressStreet)
	}
	if req.AddressCity != nil {
		createQuery.SetNillableAddressCity(req.AddressCity)
	}
	if req.AddressState != nil {
		createQuery.SetNillableAddressState(req.AddressState)
	}
	if req.AddressZip != nil {
		createQuery.SetNillableAddressZip(req.AddressZip)
	}
	if req.AddressCountry != nil {
		createQuery.SetNillableAddressCountry(req.AddressCountry)
	}
	if req.County != nil {
		createQuery.SetNillableCounty(req.County)
	}
	if req.PreferredContactMethod != nil {
		createQuery.SetPreferredContactMethod(*req.PreferredContactMethod)
	}
	if req.LeadSource != nil {
		createQuery.SetLeadSource(*req.LeadSource)
	}
	if req.LeadStatus != nil {
		createQuery.SetLeadStatus(*req.LeadStatus)
	}
	if req.LeadScore != nil {
		createQuery.SetLeadScore(*req.LeadScore)
	}
	if req.CreditScore != nil {
		createQuery.SetNillableCreditScore(req.CreditScore)
	}
	if req.AssignedToUserID != nil {
		createQuery.SetNillableAssignedToUserID(req.AssignedToUserID)
	}
	if req.EmployerName != nil {
		createQuery.SetNillableEmployerName(req.EmployerName)
	}
	if req.EmployerPhone != nil {
		createQuery.SetNillableEmployerPhone(req.EmployerPhone)
	}
	if req.MonthlyIncome != nil {
		createQuery.SetNillableMonthlyIncome(req.MonthlyIncome)
	}
	if req.HousingStatus != nil {
		createQuery.SetNillableHousingStatus(req.HousingStatus)
	}
	if req.MonthlyPayment != nil {
		createQuery.SetNillableMonthlyPayment(req.MonthlyPayment)
	}

	// Execute create
	cust, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create customer",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": cust,
	})
}

// Update updates an existing customer
func (h *CustomersHandler) Update(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	customerID := c.Params("id")
	ctx := context.Background()

	// Parse request body (same structure as Create)
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify customer exists and belongs to tenant
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

	// Build update query
	updateQuery := h.db.Customer.UpdateOne(cust)

	// Update fields dynamically based on request
	if val, ok := req["firstName"].(string); ok {
		updateQuery.SetFirstName(val)
	}
	if val, ok := req["lastName"].(string); ok {
		updateQuery.SetLastName(val)
	}
	if val, ok := req["email"].(string); ok {
		updateQuery.SetEmail(val)
	}
	if val, ok := req["phone"].(string); ok {
		updateQuery.SetPhone(val)
	}
	if val, ok := req["mobile"].(string); ok {
		updateQuery.SetMobile(val)
	}
	if val, ok := req["leadStatus"].(string); ok {
		updateQuery.SetLeadStatus(val)
	}
	if val, ok := req["leadScore"].(float64); ok {
		updateQuery.SetLeadScore(int(val))
	}
	if val, ok := req["creditScore"].(float64); ok {
		updateQuery.SetCreditScore(int(val))
	}
	if val, ok := req["assignedToUserId"].(string); ok {
		updateQuery.SetAssignedToUserID(val)
	}

	// Execute update
	updated, err := updateQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update customer",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// Delete soft-deletes a customer
func (h *CustomersHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	customerID := c.Params("id")
	ctx := context.Background()

	// Verify customer exists and belongs to tenant
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

	// Soft delete by setting deleted_at timestamp
	now := time.Now()
	_, err = h.db.Customer.
		UpdateOne(cust).
		SetDeletedAt(now).
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete customer",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}
