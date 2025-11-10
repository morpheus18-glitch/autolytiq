package schema

import (
	"time"
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// TradeIn holds the schema definition for the TradeIn entity.
type TradeIn struct {
	ent.Schema
}

func (TradeIn) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Unique().Immutable(),
		field.String("tenant_id").NotEmpty(),
		field.String("deal_id").Optional().Nillable(),
		field.String("customer_id").Optional().Nillable(),
		field.String("vin").NotEmpty(),
		field.Int("year"),
		field.String("make"),
		field.String("model"),
		field.String("trim").Optional().Nillable(),
		field.Int("mileage"),
		field.String("condition").Optional().Nillable(),
		field.Int("estimated_value").Optional().Nillable(),
		field.Int("payoff_amount").Optional().Nillable(),
		field.Int("actual_cash_value").Optional().Nillable(),
		field.Int("allowance").Optional().Nillable(),
		field.String("status").Default("PENDING"),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (TradeIn) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("trade_ins").Field("tenant_id").Unique().Required(),
		edge.From("deal", Deal.Type).Ref("trade_ins").Field("deal_id").Unique(),
		edge.From("customer", Customer.Type).Ref("trade_ins").Field("customer_id").Unique(),
	}
}

func (TradeIn) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("deal_id"),
		index.Fields("vin"),
	}
}
