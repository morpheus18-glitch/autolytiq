package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/autolytiq/backend/ent"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// Client wraps the Ent client with database connection
type Client struct {
	*ent.Client
}

// NewClient creates a new database client
func NewClient() (*Client, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	client, err := ent.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Database connection established")

	return &Client{Client: client}, nil
}

// Close closes the database connection
func (c *Client) Close() error {
	if c.Client != nil {
		return c.Client.Close()
	}
	return nil
}

// AutoMigrate runs automatic migrations
func (c *Client) AutoMigrate(ctx context.Context) error {
	if err := c.Client.Schema.Create(ctx); err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}
	log.Println("✅ Database schema migrated successfully")
	return nil
}
