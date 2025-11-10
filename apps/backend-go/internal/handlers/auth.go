package handlers

import (
	"context"
	"crypto/rsa"
	"fmt"
	"os"
	"time"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/user"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	privateKey *rsa.PrivateKey
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	db *ent.Client
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(db *ent.Client) *AuthHandler {
	return &AuthHandler{db: db}
}

// LoadPrivateKey loads the RSA private key for JWT signing
func LoadPrivateKey() error {
	privateKeyPath := os.Getenv("JWT_PRIVATE_KEY_PATH")
	if privateKeyPath == "" {
		privateKeyPath = "../backend/keys/jwt-private.pem"
	}

	keyData, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return fmt.Errorf("failed to read private key: %w", err)
	}

	key, err := jwt.ParseRSAPrivateKeyFromPEM(keyData)
	if err != nil {
		return fmt.Errorf("failed to parse private key: %w", err)
	}

	privateKey = key
	return nil
}

// Login authenticates a user and returns a JWT token
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	ctx := context.Background()

	// Parse request body
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "email and password are required",
		})
	}

	// Find user by email
	foundUser, err := h.db.User.
		Query().
		Where(user.Email(req.Email)).
		WithTenant().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid credentials",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to authenticate",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Check tenant is active
	tenant := foundUser.Edges.Tenant
	if tenant.Status != "ACTIVE" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Account is not active",
		})
	}

	// Update last login
	h.db.User.UpdateOne(foundUser).SetLastLoginAt(time.Now()).Save(ctx)

	// Generate JWT token
	token, err := h.generateToken(foundUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":        foundUser.ID,
			"email":     foundUser.Email,
			"firstName": foundUser.FirstName,
			"lastName":  foundUser.LastName,
			"role":      foundUser.Role,
			"tenantId":  foundUser.TenantID,
		},
	})
}

// Me returns the current authenticated user
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	foundUser, err := h.db.User.
		Query().
		Where(
			user.And(
				user.ID(userID),
				user.TenantID(tenantID),
			),
		).
		WithTenant().
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

	return c.JSON(fiber.Map{
		"user": fiber.Map{
			"id":        foundUser.ID,
			"email":     foundUser.Email,
			"firstName": foundUser.FirstName,
			"lastName":  foundUser.LastName,
			"role":      foundUser.Role,
			"tenantId":  foundUser.TenantID,
			"tenant": fiber.Map{
				"id":     foundUser.Edges.Tenant.ID,
				"name":   foundUser.Edges.Tenant.Name,
				"status": foundUser.Edges.Tenant.Status,
			},
		},
	})
}

// SwitchTenant switches the user to a different tenant
func (h *AuthHandler) SwitchTenant(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		TenantID string `json:"tenantId"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify user has access to the target tenant
	foundUser, err := h.db.User.
		Query().
		Where(
			user.And(
				user.ID(userID),
				user.TenantID(req.TenantID),
			),
		).
		WithTenant().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied to this tenant",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to switch tenant",
		})
	}

	// Check tenant is active
	if foundUser.Edges.Tenant.Status != "ACTIVE" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Tenant is not active",
		})
	}

	// Generate new JWT token with new tenant
	token, err := h.generateToken(foundUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":        foundUser.ID,
			"email":     foundUser.Email,
			"firstName": foundUser.FirstName,
			"lastName":  foundUser.LastName,
			"role":      foundUser.Role,
			"tenantId":  foundUser.TenantID,
		},
	})
}

// Refresh refreshes the JWT token
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Fetch current user
	foundUser, err := h.db.User.
		Query().
		Where(
			user.And(
				user.ID(userID),
				user.TenantID(tenantID),
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
			"error": "Failed to refresh token",
		})
	}

	// Generate new JWT token
	token, err := h.generateToken(foundUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": token,
	})
}

// generateToken generates a JWT token for a user
func (h *AuthHandler) generateToken(user *ent.User) (string, error) {
	// Create claims
	claims := middleware.Claims{
		UserID:   user.ID,
		TenantID: user.TenantID,
		Email:    user.Email,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	// Sign token with private key
	tokenString, err := token.SignedString(privateKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
