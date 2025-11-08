/**
 * Notes Component Demo
 *
 * Shows the Notes component in different contexts
 */

import { Notes } from '@repo/ui';
import type { Note } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

export default function NotesDemo() {
  const handleSave = async (note: Note) => {
    console.log('Note saved:', note);
    // TODO: Wire up actual API call
    // await fetch('/api/notes', { method: 'POST', body: JSON.stringify(note) });
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Notes Component Demo</h1>
        <p className="text-text-secondary">Context-aware note-taking for different parts of the application</p>
      </div>

      {/* Customer Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Notes Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Notes
            context="customer"
            entityId="cust-demo-123"
            onSave={handleSave}
            userId="user-demo"
            userName="Demo Sales Rep"
            height="md"
          />
          <p className="text-xs text-text-tertiary mt-4">
            💡 These notes will appear in the customer's timeline and activity history
          </p>
        </CardContent>
      </Card>

      {/* Appraisal Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Appraisal Notes Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Exterior */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-2">Exterior Condition</h3>
              <Notes
                context="appraisal"
                entityId="appr-demo-456"
                onSave={handleSave}
                userId="user-demo"
                userName="Demo Appraiser"
                height="lg"
                tags={['exterior']}
                placeholder="Document paint, body panels, trim damage..."
              />
            </div>

            {/* Interior */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-2">Interior Condition</h3>
              <Notes
                context="appraisal"
                entityId="appr-demo-456"
                onSave={handleSave}
                userId="user-demo"
                userName="Demo Appraiser"
                height="lg"
                tags={['interior']}
                placeholder="Document seats, dashboard, carpets..."
              />
            </div>
          </div>
          <p className="text-xs text-text-tertiary">
            ✅ These notes stay visible and saved with THIS appraisal only (not customer timeline)
          </p>
        </CardContent>
      </Card>

      {/* Showroom Manager Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Showroom Manager Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Notes
            context="showroom"
            entityId="cust-demo-123"
            onSave={handleSave}
            userId="user-demo"
            userName="Demo Showroom Manager"
            height="md"
          />
          <p className="text-xs text-text-tertiary mt-4">
            💡 These notes also appear in the customer's timeline (same as customer notes)
          </p>
        </CardContent>
      </Card>

      {/* Deal Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Notes Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Notes
            context="deal"
            entityId="deal-demo-789"
            onSave={handleSave}
            userId="user-demo"
            userName="Demo F&I Manager"
            height="md"
            tags={['negotiation']}
          />
          <p className="text-xs text-text-tertiary mt-4">
            📝 Visible in deal history, helps track negotiation progress
          </p>
        </CardContent>
      </Card>

      {/* Private Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Private Notes Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Notes
            context="customer"
            entityId="cust-demo-123"
            onSave={handleSave}
            userId="user-demo"
            userName="Demo Manager"
            isPrivate={true}
            height="sm"
          />
          <p className="text-xs text-text-tertiary mt-4">
            🔒 Only you can see private notes
          </p>
        </CardContent>
      </Card>

      {/* Different Heights */}
      <Card>
        <CardHeader>
          <CardTitle>Height Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-text-tertiary mb-2">Small</p>
              <Notes
                context="standalone"
                entityId="demo"
                onSave={handleSave}
                height="sm"
                showCharacterCount={false}
                showSaveStatus={false}
              />
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-2">Medium (default)</p>
              <Notes
                context="standalone"
                entityId="demo"
                onSave={handleSave}
                height="md"
                showCharacterCount={false}
                showSaveStatus={false}
              />
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-2">Large</p>
              <Notes
                context="standalone"
                entityId="demo"
                onSave={handleSave}
                height="lg"
                showCharacterCount={false}
                showSaveStatus={false}
              />
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-2">Extra Large</p>
              <Notes
                context="standalone"
                entityId="demo"
                onSave={handleSave}
                height="xl"
                showCharacterCount={false}
                showSaveStatus={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Auto-save after 2 seconds of inactivity
            </li>
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Visual save status indicators (Saving... / Saved / Error)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Character count with max length enforcement
            </li>
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Context-aware placeholders
            </li>
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Tags for categorization
            </li>
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Private notes (only visible to creator)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-status-success">✓</span>
              Timeline integration for customer/lead notes
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-text-tertiary border-t border-border-base pt-4">
        See <code className="px-2 py-1 bg-surface-muted rounded">NOTES_COMPONENT_GUIDE.md</code> for complete documentation
      </div>
    </div>
  );
}
