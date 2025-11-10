package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Customer holds the schema definition for the Customer entity.
type Customer struct {
	ent.Schema
}

// Fields of the Customer.
func (Customer) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Unique().
			Immutable(),

		field.String("tenant_id").
			NotEmpty(),

		field.String("first_name").
			NotEmpty(),

		field.String("middle_name").
			Optional().
			Nillable(),

		field.String("last_name").
			NotEmpty(),

		field.String("suffix").
			Optional().
			Nillable(),

		field.String("email").
			Optional().
			Nillable(),

		field.String("phone").
			Optional().
			Nillable(),

		field.String("phone_secondary").
			Optional().
			Nillable(),

		field.String("mobile").
			Optional().
			Nillable(),

		field.Time("date_of_birth").
			Optional().
			Nillable(),

		field.String("license_number").
			Optional().
			Nillable(),

		field.String("license_state").
			Optional().
			Nillable(),

		field.Time("license_expiry").
			Optional().
			Nillable(),

		field.String("ssn").
			Sensitive().
			Optional().
			Nillable(),

		field.String("address_street").
			Optional().
			Nillable(),

		field.String("address_city").
			Optional().
			Nillable(),

		field.String("address_state").
			Optional().
			Nillable(),

		field.String("address_zip").
			Optional().
			Nillable(),

		field.String("address_country").
			Optional().
			Nillable(),

		field.String("county").
			Optional().
			Nillable(),

		field.String("preferred_contact_method").
			Default("EMAIL"),

		field.String("lead_source").
			Default("WEBSITE"),

		field.String("lead_status").
			Default("NEW"),

		field.Int("lead_score").
			Default(0),

		field.Int("credit_score").
			Optional().
			Nillable(),

		field.String("assigned_to_user_id").
			Optional().
			Nillable(),

		field.String("employer_name").
			Optional().
			Nillable(),

		field.String("employer_phone").
			Optional().
			Nillable(),

		field.Int("monthly_income").
			Optional().
			Nillable(),

		field.String("housing_status").
			Optional().
			Nillable(),

		field.Int("monthly_payment").
			Optional().
			Nillable(),

		field.Time("created_at").
			Default(time.Now).
			Immutable(),

		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),

		field.Time("deleted_at").
			Optional().
			Nillable(),
	}
}

// Edges of the Customer.
func (Customer) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("customers").
			Field("tenant_id").
			Unique().
			Required(),

		edge.From("assigned_to", User.Type).
			Ref("customers").
			Field("assigned_to_user_id").
			Unique(),

		edge.To("deals", Deal.Type),
		edge.To("leads", Lead.Type),
		edge.To("trade_ins", TradeIn.Type),
	}
}

// Indexes of the Customer.
func (Customer) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("tenant_id", "email"),
		index.Fields("tenant_id", "phone"),
		index.Fields("assigned_to_user_id"),
	}
}
