package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Vehicle holds the schema definition for the Vehicle entity.
type Vehicle struct {
	ent.Schema
}

// Fields of the Vehicle.
func (Vehicle) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Unique().Immutable(),
		field.String("tenant_id").NotEmpty(),
		field.String("vin").NotEmpty(),
		field.Int("year"),
		field.String("make"),
		field.String("model"),
		field.String("trim").Optional().Nillable(),
		field.Int("mileage"),
		field.String("stock_number").Optional().Nillable(),
		field.String("status").Default("AVAILABLE"),
		field.Int("cost").Optional().Nillable(),
		field.Int("market_price").Optional().Nillable(),
		field.Int("asking_price").Optional().Nillable(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Vehicle.
func (Vehicle) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("vehicles").
			Field("tenant_id").
			Unique().
			Required(),
		edge.To("deals", Deal.Type),
	}
}

// Indexes of the Vehicle.
func (Vehicle) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("tenant_id", "vin").Unique(),
		index.Fields("tenant_id", "stock_number"),
	}
}
