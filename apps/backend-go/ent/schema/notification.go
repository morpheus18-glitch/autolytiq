package schema

import (
	"time"
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Notification holds the schema definition for the Notification entity.
type Notification struct {
	ent.Schema
}

func (Notification) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Unique().Immutable(),
		field.String("tenant_id").NotEmpty(),
		field.String("user_id").NotEmpty(),
		field.String("type").NotEmpty(),
		field.String("title").NotEmpty(),
		field.Text("message"),
		field.JSON("data", map[string]interface{}{}).Optional(),
		field.Bool("is_read").Default(false),
		field.Time("read_at").Optional().Nillable(),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

func (Notification) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("notifications").Field("tenant_id").Unique().Required(),
		edge.From("user", User.Type).Ref("notifications").Field("user_id").Unique().Required(),
	}
}

func (Notification) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id"),
		index.Fields("user_id", "is_read"),
		index.Fields("created_at"),
	}
}
