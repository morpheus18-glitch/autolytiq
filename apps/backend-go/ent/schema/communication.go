package schema

import "entgo.io/ent"

// Communication holds the schema definition for the Communication entity.
type Communication struct {
	ent.Schema
}

// Fields of the Communication.
func (Communication) Fields() []ent.Field {
	return nil
}

// Edges of the Communication.
func (Communication) Edges() []ent.Edge {
	return nil
}
