package main

import (
	"context"
	"log"
	"time"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/tenant"
	"github.com/autolytiq/backend/ent/user"
	"github.com/autolytiq/backend/pkg/database"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	log.Println("🌱 Starting database seeding...")

	// Initialize database client
	dbClient, err := database.NewClient()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbClient.Close()

	ctx := context.Background()

	// Check if demo tenant already exists
	existingTenant, err := dbClient.Tenant.
		Query().
		Where(tenant.Subdomain("demo")).
		Only(ctx)

	var demoTenant *ent.Tenant

	if err != nil && !ent.IsNotFound(err) {
		log.Fatalf("Error checking for existing tenant: %v", err)
	}

	if existingTenant != nil {
		log.Println("✅ Demo tenant already exists")
		demoTenant = existingTenant
	} else {
		// Create demo tenant
		log.Println("📦 Creating demo tenant...")
		demoTenant, err = dbClient.Tenant.
			Create().
			SetID(uuid.New().String()).
			SetName("Demo Dealership").
			SetSubdomain("demo").
			SetPlan("PRO").
			SetStatus("ACTIVE").
			SetBillingEmail("billing@demo.autolytiq.com").
			SetSubscriptionEndsAt(time.Now().AddDate(1, 0, 0)). // 1 year from now
			Save(ctx)

		if err != nil {
			log.Fatalf("Failed to create demo tenant: %v", err)
		}
		log.Printf("✅ Created demo tenant: %s (ID: %s)\n", demoTenant.Name, demoTenant.ID)
	}

	// Check if demo user already exists
	existingUser, err := dbClient.User.
		Query().
		Where(
			user.And(
				user.Email("demo@autolytiq.com"),
				user.TenantID(demoTenant.ID),
			),
		).
		Only(ctx)

	if err != nil && !ent.IsNotFound(err) {
		log.Fatalf("Error checking for existing user: %v", err)
	}

	if existingUser != nil {
		log.Println("✅ Demo user already exists")
	} else {
		// Hash password
		log.Println("🔒 Hashing password...")
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("demo123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}

		// Create demo user
		log.Println("👤 Creating demo user...")
		demoUser, err := dbClient.User.
			Create().
			SetID(uuid.New().String()).
			SetTenantID(demoTenant.ID).
			SetEmail("demo@autolytiq.com").
			SetPassword(string(hashedPassword)).
			SetFirstName("Demo").
			SetLastName("User").
			SetRole("ADMIN").
			SetStatus("ACTIVE").
			Save(ctx)

		if err != nil {
			log.Fatalf("Failed to create demo user: %v", err)
		}

		log.Printf("✅ Created demo user: %s %s (%s)\n", demoUser.FirstName, demoUser.LastName, demoUser.Email)
	}

	log.Println("\n🎉 Seeding completed successfully!")
	log.Println("\n📋 Demo Credentials:")
	log.Println("   Email:    demo@autolytiq.com")
	log.Println("   Password: demo123")
	log.Println("   Tenant:   demo")
}
