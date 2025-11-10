package schema

import "entgo.io/ent"

// DealWorksheet holds the schema definition for the DealWorksheet entity.
type DealWorksheet struct {
	ent.Schema
}

// Fields of the DealWorksheet.
func (DealWorksheet) Fields() []ent.Field {
	return nil
}

// Edges of the DealWorksheet.
func (DealWorksheet) Edges() []ent.Edge {
	return nil
}
