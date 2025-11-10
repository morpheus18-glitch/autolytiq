package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Unique().
			Immutable().
			Comment("Unique user identifier (CUID)"),

		field.String("tenant_id").
			NotEmpty().
			Comment("Reference to tenant"),

		field.String("email").
			NotEmpty().
			Comment("User email address"),

		field.String("password").
			Sensitive().
			Comment("Hashed password"),

		field.String("first_name").
			NotEmpty().
			Comment("User first name"),

		field.String("last_name").
			NotEmpty().
			Comment("User last name"),

		field.String("phone").
			Optional().
			Nillable().
			Comment("Phone number"),

		field.String("role").
			Default("SALES").
			Comment("User role: SALES, SALES_MANAGER, FINANCE_MANAGER, GM, ADMIN"),

		field.String("role_preset_id").
			Optional().
			Nillable().
			Comment("Reference to role preset"),

		field.JSON("permissions", []string{}).
			Default([]string{}).
			Comment("Array of permission strings"),

		field.JSON("custom_permissions", []string{}).
			Optional().
			Comment("Custom permission overrides"),

		field.String("status").
			Default("ACTIVE").
			Comment("User status: ACTIVE, INACTIVE, SUSPENDED"),

		field.Bool("is_super_admin").
			Default(false).
			Comment("Super admin flag"),

		field.Time("last_login_at").
			Optional().
			Nillable().
			Comment("Last login timestamp"),

		field.Time("created_at").
			Default(time.Now).
			Immutable().
			Comment("Record creation timestamp"),

		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("Last update timestamp"),

		field.Time("deleted_at").
			Optional().
			Nillable().
			Comment("Soft delete timestamp"),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("users").
			Field("tenant_id").
			Unique().
			Required(),

		edge.To("customers", Customer.Type),
		edge.To("deals", Deal.Type),
		edge.To("leads", Lead.Type),
		edge.To("notifications", Notification.Type),
		edge.To("notes", Note.Type),
	}
}

// Indexes of the User.
func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("tenant_id", "email").Unique(),
		index.Fields("is_super_admin"),
	}
}
