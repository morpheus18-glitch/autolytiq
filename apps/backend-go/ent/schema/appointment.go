package schema

import "entgo.io/ent"

// Appointment holds the schema definition for the Appointment entity.
type Appointment struct {
	ent.Schema
}

// Fields of the Appointment.
func (Appointment) Fields() []ent.Field {
	return nil
}

// Edges of the Appointment.
func (Appointment) Edges() []ent.Edge {
	return nil
}
