package schema

import "entgo.io/ent"

// CreditApplication holds the schema definition for the CreditApplication entity.
type CreditApplication struct {
	ent.Schema
}

// Fields of the CreditApplication.
func (CreditApplication) Fields() []ent.Field {
	return nil
}

// Edges of the CreditApplication.
func (CreditApplication) Edges() []ent.Edge {
	return nil
}
