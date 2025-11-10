package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Deal holds the schema definition for the Deal entity.
type Deal struct {
	ent.Schema
}

// Fields of the Deal.
func (Deal) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Unique().Immutable(),
		field.String("tenant_id").NotEmpty(),
		field.String("customer_id").Optional().Nillable(),
		field.String("vehicle_id").Optional().Nillable(),
		field.String("salesperson_id").Optional().Nillable(),
		field.String("deal_number").NotEmpty(),
		field.String("status").Default("DRAFT"),
		field.String("stage").Default("LEAD"),
		field.Int("sale_price").Optional().Nillable(),
		field.Int("down_payment").Optional().Nillable(),
		field.Int("amount_financed").Optional().Nillable(),
		field.Int("monthly_payment").Optional().Nillable(),
		field.Int("term_months").Optional().Nillable(),
		field.Float("interest_rate").Optional().Nillable(),
		field.Int("gross_profit").Optional().Nillable(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Deal.
func (Deal) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("deals").
			Field("tenant_id").
			Unique().
			Required(),
		edge.From("customer", Customer.Type).
			Ref("deals").
			Field("customer_id").
			Unique(),
		edge.From("vehicle", Vehicle.Type).
			Ref("deals").
			Field("vehicle_id").
			Unique(),
		edge.From("salesperson", User.Type).
			Ref("deals").
			Field("salesperson_id").
			Unique(),
		edge.To("trade_ins", TradeIn.Type),
	}
}

// Indexes of the Deal.
func (Deal) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("tenant_id", "deal_number").Unique(),
		index.Fields("customer_id"),
		index.Fields("vehicle_id"),
		index.Fields("salesperson_id"),
	}
}
