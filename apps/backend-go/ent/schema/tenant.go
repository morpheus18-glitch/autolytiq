package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Tenant holds the schema definition for the Tenant entity.
type Tenant struct {
	ent.Schema
}

// Fields of the Tenant.
func (Tenant) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Unique().
			Immutable().
			Comment("Unique tenant identifier (CUID)"),

		field.String("name").
			NotEmpty().
			Comment("Tenant organization name"),

		field.String("subdomain").
			Unique().
			NotEmpty().
			Comment("Unique subdomain for tenant"),

		field.String("plan").
			Default("BASIC").
			Comment("Subscription plan: BASIC, PRO, ENTERPRISE"),

		field.String("status").
			Default("ACTIVE").
			Comment("Tenant status: ACTIVE, SUSPENDED, CANCELLED"),

		field.JSON("settings", map[string]interface{}{}).
			Default(map[string]interface{}{}).
			Comment("JSON configuration settings"),

		field.String("billing_email").
			NotEmpty().
			Comment("Billing contact email"),

		field.Time("subscription_ends_at").
			Optional().
			Nillable().
			Comment("When subscription expires"),

		field.Time("created_at").
			Default(time.Now).
			Immutable().
			Comment("Record creation timestamp"),

		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("Last update timestamp"),
	}
}

// Edges of the Tenant.
func (Tenant) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("users", User.Type),
		edge.To("customers", Customer.Type),
		edge.To("vehicles", Vehicle.Type),
		edge.To("deals", Deal.Type),
		edge.To("leads", Lead.Type),
		edge.To("trade_ins", TradeIn.Type),
		edge.To("notifications", Notification.Type),
		edge.To("notes", Note.Type),
	}
}
