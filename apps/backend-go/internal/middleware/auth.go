package middleware

import (
	"crypto/rsa"
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var (
	publicKey *rsa.PublicKey
)

// Claims represents the JWT claims structure
type Claims struct {
	UserID   string `json:"userId"`
	TenantID string `json:"tenantId"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// LoadPublicKey loads the RSA public key for JWT verification
func LoadPublicKey() error {
	publicKeyPath := os.Getenv("JWT_PUBLIC_KEY_PATH")
	if publicKeyPath == "" {
		publicKeyPath = "../backend/keys/jwt-public.pem"
	}

	keyData, err := os.ReadFile(publicKeyPath)
	if err != nil {
		return fmt.Errorf("failed to read public key: %w", err)
	}

	key, err := jwt.ParseRSAPublicKeyFromPEM(keyData)
	if err != nil {
		return fmt.Errorf("failed to parse public key: %w", err)
	}

	publicKey = key
	return nil
}

// JWTAuth middleware verifies JWT tokens
func JWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]

		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			// Verify signing method
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return publicKey, nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		if !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token is not valid",
			})
		}

		// Extract claims
		claims, ok := token.Claims.(*Claims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token claims",
			})
		}

		// Store user context in fiber locals
		c.Locals("userId", claims.UserID)
		c.Locals("tenantId", claims.TenantID)
		c.Locals("userEmail", claims.Email)
		c.Locals("userRole", claims.Role)

		return c.Next()
	}
}

// GetUserID retrieves the user ID from context
func GetUserID(c *fiber.Ctx) string {
	if userID, ok := c.Locals("userId").(string); ok {
		return userID
	}
	return ""
}

// GetTenantID retrieves the tenant ID from context
func GetTenantID(c *fiber.Ctx) string {
	if tenantID, ok := c.Locals("tenantId").(string); ok {
		return tenantID
	}
	return ""
}

// GetUserEmail retrieves the user email from context
func GetUserEmail(c *fiber.Ctx) string {
	if email, ok := c.Locals("userEmail").(string); ok {
		return email
	}
	return ""
}

// GetUserRole retrieves the user role from context
func GetUserRole(c *fiber.Ctx) string {
	if role, ok := c.Locals("userRole").(string); ok {
		return role
	}
	return ""
}
