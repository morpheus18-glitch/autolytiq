package schema

import "entgo.io/ent"

// LeadScore holds the schema definition for the LeadScore entity.
type LeadScore struct {
	ent.Schema
}

// Fields of the LeadScore.
func (LeadScore) Fields() []ent.Field {
	return nil
}

// Edges of the LeadScore.
func (LeadScore) Edges() []ent.Edge {
	return nil
}
