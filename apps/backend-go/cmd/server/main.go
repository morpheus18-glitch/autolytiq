package main

import (
	"context"
	"log"
	"os"

	"github.com/autolytiq/backend/internal/handlers"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/autolytiq/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	db, err := database.NewClient()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Auto-migrate database schema
	ctx := context.Background()
	if err := db.AutoMigrate(ctx); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Load JWT public key
	if err := middleware.LoadPublicKey(); err != nil {
		log.Fatalf("Failed to load JWT public key: %v", err)
	}
	log.Println("✅ JWT public key loaded successfully")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "AutolytiQ Backend",
		ServerHeader: "Fiber",
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     getEnv("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173"),
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))

	// Health check endpoint (public)
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "autolytiq-backend-go",
			"version": "1.0.0",
		})
	})

	// API routes
	api := app.Group("/api")

	// Version info (public)
	api.Get("/version", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"version":   "1.0.0",
			"runtime":   "go",
			"framework": "fiber",
		})
	})

	// Protected routes (require JWT + tenant validation)
	protected := api.Group("", middleware.JWTAuth(), middleware.TenantScoping(db.Client))

	// Customers endpoints
	customersHandler := handlers.NewCustomersHandler(db.Client)
	protected.Get("/customers", customersHandler.List)
	protected.Get("/customers/:id", customersHandler.Get)

	// Start server
	port := getEnv("PORT", "3001")
	log.Printf("🚀 Server starting on port %s\n", port)

	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// Helper function to get environment variables with defaults
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
