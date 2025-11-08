/**
 * Notes Component Usage Examples
 *
 * Shows how to use the Notes component in different contexts:
 * - Customer timeline
 * - Showroom manager
 * - Appraisals
 * - Deals
 * - Vehicles
 */

import { Notes } from '@repo/ui';
import type { Note } from '@repo/ui';

// =============================================================================
// Example 1: Customer Page - Notes attach to customer timeline
// =============================================================================

export function CustomerNotesExample() {
  const customerId = 'cust-123';

  const handleSaveCustomerNote = async (note: Note) => {
    // POST to /api/notes
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...note,
        customerId, // Attach to customer
      }),
    });

    const savedNote = await response.json();
    console.log('Note saved to customer timeline:', savedNote);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Customer Notes</h2>

      <Notes
        context="customer"
        entityId={customerId}
        onSave={handleSaveCustomerNote}
        userId="user-456"
        userName="Sales Rep"
        height="md"
        showCharacterCount
        showSaveStatus
      />

      <p className="text-xs text-text-tertiary mt-2">
        💡 This note will appear in the customer's timeline and activity history
      </p>
    </div>
  );
}

// =============================================================================
// Example 2: Showroom Manager - Notes attach to customer timeline
// =============================================================================

export function ShowroomNotesExample() {
  const customerId = 'cust-123';

  const handleSaveShowroomNote = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...note,
        customerId, // Also attaches to customer
      }),
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Showroom Manager Notes</h2>

      <Notes
        context="showroom"
        entityId={customerId}
        onSave={handleSaveShowroomNote}
        userId="user-789"
        userName="Showroom Manager"
        height="md"
        placeholder="Note what happened during the showroom visit..."
      />

      <p className="text-xs text-text-tertiary mt-2">
        💡 These notes also go to the customer timeline for full history tracking
      </p>
    </div>
  );
}

// =============================================================================
// Example 3: Appraisal Page - Notes stay with the appraisal
// =============================================================================

export function AppraisalNotesExample() {
  const appraisalId = 'appr-456';

  const handleSaveAppraisalNote = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...note,
        appraisalId, // Stays with appraisal
      }),
    });
  };

  return (
    <div className="p-4 bg-surface-muted rounded-lg">
      <h3 className="text-sm font-medium mb-3">Appraisal Notes</h3>

      <Notes
        context="appraisal"
        entityId={appraisalId}
        onSave={handleSaveAppraisalNote}
        userId="user-123"
        userName="Appraiser"
        height="lg"
        placeholder="Document condition, damage, modifications..."
        tags={['condition', 'inspection']}
      />

      <p className="text-xs text-text-tertiary mt-2">
        ✅ This note stays visible and saved with THIS appraisal only
      </p>
    </div>
  );
}

// =============================================================================
// Example 4: Deal Page - Notes attach to deal history
// =============================================================================

export function DealNotesExample() {
  const dealId = 'deal-789';

  const handleSaveDealNote = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...note,
        dealId, // Attaches to deal
      }),
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Deal Notes</h2>

      <Notes
        context="deal"
        entityId={dealId}
        onSave={handleSaveDealNote}
        userId="user-456"
        userName="F&I Manager"
        height="md"
        isPrivate={false}
        tags={['negotiation']}
      />

      <p className="text-xs text-text-tertiary mt-2">
        📝 Visible in deal history, helps track negotiation progress
      </p>
    </div>
  );
}

// =============================================================================
// Example 5: Vehicle Page - Notes stay with vehicle record
// =============================================================================

export function VehicleNotesExample() {
  const vehicleId = 'veh-321';

  const handleSaveVehicleNote = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...note,
        vehicleId, // Stays with vehicle
      }),
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Vehicle Notes</h2>

      <Notes
        context="vehicle"
        entityId={vehicleId}
        onSave={handleSaveVehicleNote}
        userId="user-789"
        userName="Inventory Manager"
        height="md"
        tags={['maintenance', 'cosmetic']}
      />

      <p className="text-xs text-text-tertiary mt-2">
        🚗 Stays with the vehicle through its lifecycle (inventory, sale, service)
      </p>
    </div>
  );
}

// =============================================================================
// Example 6: Private Notes
// =============================================================================

export function PrivateNotesExample() {
  const customerId = 'cust-123';

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Private Notes</h2>

      <Notes
        context="customer"
        entityId={customerId}
        onSave={async (note) => {
          await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        }}
        userId="user-456"
        userName="Sales Manager"
        isPrivate={true}
        height="sm"
        placeholder="Private notes only visible to you..."
      />

      <p className="text-xs text-text-tertiary mt-2">
        🔒 Only you can see these notes
      </p>
    </div>
  );
}

// =============================================================================
// Example 7: Combined Usage - Customer Detail Page
// =============================================================================

export function CustomerDetailPageExample() {
  const customerId = 'cust-123';

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Customer: John Doe</h1>

      {/* Customer Info... */}

      {/* Notes Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Add Note</h2>

        <Notes
          context="customer"
          entityId={customerId}
          onSave={async (note) => {
            // Save to customer timeline
            await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...note,
                customerId,
              }),
            });

            // Refresh timeline
            // refetchCustomerTimeline();
          }}
          userId="current-user"
          userName="Sales Rep"
          height="md"
        />

        {/* Timeline showing all notes */}
        {/* <CustomerTimeline customerId={customerId} /> */}
      </div>
    </div>
  );
}

// =============================================================================
// Example 8: Multiple Notes in One View (Appraisal with sections)
// =============================================================================

export function AppraisalDetailExample() {
  const appraisalId = 'appr-456';

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Trade-In Appraisal</h1>

      {/* Vehicle Info... */}

      <div className="grid grid-cols-2 gap-6">
        {/* Exterior Notes */}
        <div>
          <h3 className="text-sm font-medium mb-2">Exterior Condition</h3>
          <Notes
            context="appraisal"
            entityId={appraisalId}
            onSave={async (note) => {
              await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...note,
                  appraisalId,
                  tags: [...(note.tags || []), 'exterior'],
                }),
              });
            }}
            userId="user-123"
            userName="Appraiser"
            height="lg"
            tags={['exterior']}
            placeholder="Document exterior condition, paint, body panels..."
          />
        </div>

        {/* Interior Notes */}
        <div>
          <h3 className="text-sm font-medium mb-2">Interior Condition</h3>
          <Notes
            context="appraisal"
            entityId={appraisalId}
            onSave={async (note) => {
              await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...note,
                  appraisalId,
                  tags: [...(note.tags || []), 'interior'],
                }),
              });
            }}
            userId="user-123"
            userName="Appraiser"
            height="lg"
            tags={['interior']}
            placeholder="Document interior condition, seats, dashboard..."
          />
        </div>

        {/* Mechanical Notes */}
        <div>
          <h3 className="text-sm font-medium mb-2">Mechanical</h3>
          <Notes
            context="appraisal"
            entityId={appraisalId}
            onSave={async (note) => {
              await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...note,
                  appraisalId,
                  tags: [...(note.tags || []), 'mechanical'],
                }),
              });
            }}
            userId="user-123"
            userName="Appraiser"
            height="lg"
            tags={['mechanical']}
            placeholder="Engine, transmission, brakes, suspension..."
          />
        </div>

        {/* General Notes */}
        <div>
          <h3 className="text-sm font-medium mb-2">General Notes</h3>
          <Notes
            context="appraisal"
            entityId={appraisalId}
            onSave={async (note) => {
              await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...note,
                  appraisalId,
                }),
              });
            }}
            userId="user-123"
            userName="Appraiser"
            height="lg"
            placeholder="Any other observations..."
          />
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        ✅ All notes above are saved with THIS appraisal and will appear on the appraisal report
      </p>
    </div>
  );
}
