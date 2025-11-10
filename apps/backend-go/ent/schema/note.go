package schema

import (
	"time"
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Note holds the schema definition for the Note entity.
type Note struct {
	ent.Schema
}

func (Note) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Unique().Immutable(),
		field.String("tenant_id").NotEmpty(),
		field.String("created_by_id").NotEmpty(),
		field.String("entity_type").NotEmpty(), // "customer", "deal", "vehicle", "lead"
		field.String("entity_id").NotEmpty(),
		field.Text("content").NotEmpty(),
		field.Bool("is_pinned").Default(false),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (Note) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("notes").Field("tenant_id").Unique().Required(),
		edge.From("created_by", User.Type).Ref("notes").Field("created_by_id").Unique().Required(),
	}
}

func (Note) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "entity_type", "entity_id"),
		index.Fields("created_by_id"),
		index.Fields("created_at"),
	}
}
