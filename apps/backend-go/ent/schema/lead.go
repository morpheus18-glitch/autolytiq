package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Lead holds the schema definition for the Lead entity.
type Lead struct {
	ent.Schema
}

// Fields of the Lead.
func (Lead) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Unique().Immutable(),
		field.String("tenant_id").NotEmpty(),
		field.String("customer_id").Optional().Nillable(),
		field.String("assigned_to_id").Optional().Nillable(),
		field.String("source").Default("WEBSITE"),
		field.String("status").Default("NEW"),
		field.Int("score").Default(0),
		field.String("vehicle_interest").Optional().Nillable(),
		field.Text("notes").Optional().Nillable(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Lead.
func (Lead) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("leads").
			Field("tenant_id").
			Unique().
			Required(),
		edge.From("customer", Customer.Type).
			Ref("leads").
			Field("customer_id").
			Unique(),
		edge.From("assigned_to", User.Type).
			Ref("leads").
			Field("assigned_to_id").
			Unique(),
	}
}

// Indexes of the Lead.
func (Lead) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("customer_id"),
		index.Fields("assigned_to_id"),
		index.Fields("status"),
	}
}
