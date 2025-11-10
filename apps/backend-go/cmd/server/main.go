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

	// Load JWT keys
	if err := middleware.LoadPublicKey(); err != nil {
		log.Fatalf("Failed to load JWT public key: %v", err)
	}
	log.Println("✅ JWT public key loaded successfully")

	if err := handlers.LoadPrivateKey(); err != nil {
		log.Fatalf("Failed to load JWT private key: %v", err)
	}
	log.Println("✅ JWT private key loaded successfully")

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

	// Auth endpoints (public - no JWT required)
	authHandler := handlers.NewAuthHandler(db.Client)
	api.Post("/auth/login", authHandler.Login)

	// Protected routes (require JWT + tenant validation)
	protected := api.Group("", middleware.JWTAuth(), middleware.TenantScoping(db.Client))

	// Auth endpoints (protected)
	protected.Get("/auth/me", authHandler.Me)
	protected.Post("/auth/refresh", authHandler.Refresh)
	protected.Post("/auth/switch-tenant", authHandler.SwitchTenant)

	// Users endpoints
	usersHandler := handlers.NewUsersHandler(db.Client)
	protected.Get("/users", usersHandler.List)
	protected.Get("/users/:id", usersHandler.Get)

	// Customers endpoints
	customersHandler := handlers.NewCustomersHandler(db.Client)
	protected.Get("/customers", customersHandler.List)
	protected.Post("/customers", customersHandler.Create)
	protected.Get("/customers/:id", customersHandler.Get)
	protected.Put("/customers/:id", customersHandler.Update)
	protected.Delete("/customers/:id", customersHandler.Delete)

	// Leads endpoints
	leadsHandler := handlers.NewLeadsHandler(db.Client)
	protected.Get("/leads", leadsHandler.List)
	protected.Post("/leads", leadsHandler.Create)
	protected.Get("/leads/:id", leadsHandler.Get)
	protected.Put("/leads/:id", leadsHandler.Update)
	protected.Delete("/leads/:id", leadsHandler.Delete)

	// Vehicles endpoints
	vehiclesHandler := handlers.NewVehiclesHandler(db.Client)
	protected.Get("/vehicles", vehiclesHandler.List)
	protected.Post("/vehicles", vehiclesHandler.Create)
	protected.Get("/vehicles/search", vehiclesHandler.Search)       // Must be before /:id
	protected.Get("/vehicles/vin/:vin", vehiclesHandler.GetByVIN)   // VIN lookup
	protected.Get("/vehicles/:id", vehiclesHandler.Get)
	protected.Put("/vehicles/:id", vehiclesHandler.Update)
	protected.Delete("/vehicles/:id", vehiclesHandler.Delete)

	// Deals endpoints
	dealsHandler := handlers.NewDealsHandler(db.Client)
	protected.Get("/deals", dealsHandler.List)
	protected.Post("/deals", dealsHandler.Create)
	protected.Get("/deals/number/:dealNumber", dealsHandler.GetByDealNumber) // Must be before /:id
	protected.Get("/deals/:id", dealsHandler.Get)
	protected.Put("/deals/:id", dealsHandler.Update)
	protected.Delete("/deals/:id", dealsHandler.Delete)
	protected.Post("/deals/:id/submit", dealsHandler.Submit)

	// Notes endpoints
	notesHandler := handlers.NewNotesHandler(db.Client)
	protected.Get("/notes", notesHandler.List)
	protected.Post("/notes", notesHandler.Create)
	protected.Get("/notes/:entityType/:entityId", notesHandler.ListByEntity) // Must be before /:id
	protected.Get("/notes/:id", notesHandler.Get)
	protected.Put("/notes/:id", notesHandler.Update)
	protected.Delete("/notes/:id", notesHandler.Delete)
	protected.Post("/notes/:id/pin", notesHandler.Pin)

	// Notifications endpoints
	notificationsHandler := handlers.NewNotificationsHandler(db.Client)
	protected.Get("/notifications", notificationsHandler.List)
	protected.Post("/notifications", notificationsHandler.Create)
	protected.Get("/notifications/unread-count", notificationsHandler.GetUnreadCount) // Must be before /:id
	protected.Post("/notifications/mark-all-read", notificationsHandler.MarkAllAsRead) // Must be before /:id
	protected.Get("/notifications/:id", notificationsHandler.Get)
	protected.Post("/notifications/:id/read", notificationsHandler.MarkAsRead)
	protected.Post("/notifications/:id/unread", notificationsHandler.MarkAsUnread)
	protected.Delete("/notifications/:id", notificationsHandler.Delete)

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
