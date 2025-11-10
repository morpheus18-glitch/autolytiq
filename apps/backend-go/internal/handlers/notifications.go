package handlers

import (
	"context"
	"time"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/notification"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// NotificationsHandler handles notification-related requests
type NotificationsHandler struct {
	db *ent.Client
}

// NewNotificationsHandler creates a new notifications handler
func NewNotificationsHandler(db *ent.Client) *NotificationsHandler {
	return &NotificationsHandler{db: db}
}

// List returns all notifications for the current user
func (h *NotificationsHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	// Optional filtering
	isRead := c.Query("isRead")       // "true" or "false"
	notifType := c.Query("type")      // DEAL, LEAD, MESSAGE, TASK, SYSTEM
	limit := c.QueryInt("limit", 50)  // Default 50, max 100

	if limit > 100 {
		limit = 100
	}

	query := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
			),
		)

	if isRead == "true" {
		query = query.Where(notification.IsRead(true))
	} else if isRead == "false" {
		query = query.Where(notification.IsRead(false))
	}

	if notifType != "" {
		query = query.Where(notification.Type(notifType))
	}

	notifications, err := query.
		Order(ent.Desc(notification.FieldCreatedAt)).
		Limit(limit).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notifications",
		})
	}

	// Count unread
	unreadCount, _ := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.IsRead(false),
			),
		).
		Count(ctx)

	return c.JSON(fiber.Map{
		"data": notifications,
		"meta": fiber.Map{
			"total":  len(notifications),
			"unread": unreadCount,
		},
	})
}

// Get returns a single notification by ID
func (h *NotificationsHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	notificationID := c.Params("id")
	ctx := context.Background()

	n, err := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.ID(notificationID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Notification not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notification",
		})
	}

	return c.JSON(fiber.Map{
		"data": n,
	})
}

// Create creates a new notification (typically called by system, not users)
func (h *NotificationsHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		UserID  string                 `json:"userId"`
		Type    string                 `json:"type"`
		Title   string                 `json:"title"`
		Message string                 `json:"message"`
		Data    map[string]interface{} `json:"data"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.UserID == "" || req.Type == "" || req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "userId, type, and title are required",
		})
	}

	// Generate ID
	notificationID := middleware.GenerateID()

	// Build create query
	createQuery := h.db.Notification.Create().
		SetID(notificationID).
		SetTenantID(tenantID).
		SetUserID(req.UserID).
		SetType(req.Type).
		SetTitle(req.Title).
		SetMessage(req.Message)

	// Set optional data field
	if req.Data != nil {
		createQuery.SetData(req.Data)
	}

	// Execute create
	newNotification, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create notification",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": newNotification,
	})
}

// MarkAsRead marks a notification as read
func (h *NotificationsHandler) MarkAsRead(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	notificationID := c.Params("id")
	ctx := context.Background()

	// Verify notification exists and belongs to user
	existingNotification, err := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.ID(notificationID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Notification not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notification",
		})
	}

	// Update read status
	now := time.Now()
	updated, err := h.db.Notification.
		UpdateOne(existingNotification).
		SetIsRead(true).
		SetReadAt(now).
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update notification",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// MarkAsUnread marks a notification as unread
func (h *NotificationsHandler) MarkAsUnread(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	notificationID := c.Params("id")
	ctx := context.Background()

	// Verify notification exists and belongs to user
	existingNotification, err := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.ID(notificationID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Notification not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notification",
		})
	}

	// Update read status
	updated, err := h.db.Notification.
		UpdateOne(existingNotification).
		SetIsRead(false).
		ClearReadAt().
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update notification",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// MarkAllAsRead marks all notifications as read for the current user
func (h *NotificationsHandler) MarkAllAsRead(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	now := time.Now()
	count, err := h.db.Notification.
		Update().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.IsRead(false),
			),
		).
		SetIsRead(true).
		SetReadAt(now).
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to mark notifications as read",
		})
	}

	return c.JSON(fiber.Map{
		"message": "All notifications marked as read",
		"count":   count,
	})
}

// Delete deletes a notification
func (h *NotificationsHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	notificationID := c.Params("id")
	ctx := context.Background()

	// Verify notification exists and belongs to user
	existingNotification, err := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.ID(notificationID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Notification not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notification",
		})
	}

	// Hard delete
	err = h.db.Notification.DeleteOne(existingNotification).Exec(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete notification",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// GetUnreadCount returns the unread notification count for the current user
func (h *NotificationsHandler) GetUnreadCount(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	count, err := h.db.Notification.
		Query().
		Where(
			notification.And(
				notification.TenantID(tenantID),
				notification.UserID(userID),
				notification.IsRead(false),
			),
		).
		Count(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count notifications",
		})
	}

	return c.JSON(fiber.Map{
		"count": count,
	})
}
