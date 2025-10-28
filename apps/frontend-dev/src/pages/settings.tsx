import { FormEvent, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WorkspaceSettings {
  readonly organizationName: string;
  readonly timezone: string;
  readonly notificationEmail: string;
  readonly dealSync: boolean;
  readonly notes: string;
}

const timezoneOptions = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
];

export function SettingsPage() {
  const [settings, setSettings] = useState<WorkspaceSettings>({
    organizationName: 'Autolytiq Sandbox',
    timezone: timezoneOptions[0],
    notificationEmail: 'dev-team@autolytiq.test',
    dealSync: true,
    notes:
      'Use this workspace to validate flows and integration contracts. Once complete, port the configuration into the production repository.',
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const formStatus = useMemo(() => {
    if (!lastSaved) {
      return 'Unsaved draft';
    }

    return `Last saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [lastSaved]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSettings({
      organizationName: String(form.get('organizationName') ?? settings.organizationName),
      timezone: String(form.get('timezone') ?? settings.timezone),
      notificationEmail: String(form.get('notificationEmail') ?? settings.notificationEmail),
      dealSync: form.get('dealSync') === 'on',
      notes: String(form.get('notes') ?? settings.notes),
    });
    setLastSaved(new Date());
  };

  return (
    <div className="stack" aria-labelledby="settings-heading">
      <header className="page-header">
        <h2 id="settings-heading" className="app-header__title">
          Workspace settings
        </h2>
        <div className="page-header__actions">
          <span>{formStatus}</span>
        </div>
      </header>

      <Card title="General configuration">
        <form className="stack" onSubmit={handleSubmit} noValidate>
          <fieldset className="section">
            <legend className="section__title">Organization details</legend>
            <label htmlFor="organizationName">
              Organization name
              <input id="organizationName" name="organizationName" defaultValue={settings.organizationName} required />
            </label>
            <label htmlFor="notificationEmail">
              Notification email
              <input
                id="notificationEmail"
                name="notificationEmail"
                type="email"
                defaultValue={settings.notificationEmail}
                required
              />
            </label>
            <label htmlFor="timezone">
              Timezone
              <select id="timezone" name="timezone" defaultValue={settings.timezone}>
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="section">
            <legend className="section__title">Deal sync behavior</legend>
            <div className="checklist__item" data-state={settings.dealSync ? 'complete' : 'pending'}>
              <label className="checklist__label" htmlFor="dealSync">
                <strong>Enable production sync</strong>
                <span>
                  Keeps the development workspace in parity with production data models without mutating live records.
                </span>
              </label>
              <input id="dealSync" name="dealSync" type="checkbox" defaultChecked={settings.dealSync} />
            </div>
            <label htmlFor="notes">
              Notes for production handoff
              <textarea id="notes" name="notes" defaultValue={settings.notes} />
            </label>
          </fieldset>

          <div className="page-header__actions" role="group" aria-label="Form actions">
            <Button type="submit">Save workspace defaults</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSettings({
                  organizationName: 'Autolytiq Sandbox',
                  timezone: timezoneOptions[0],
                  notificationEmail: 'dev-team@autolytiq.test',
                  dealSync: true,
                  notes:
                    'Use this workspace to validate flows and integration contracts. Once complete, port the configuration into the production repository.',
                });
                setLastSaved(null);
              }}
            >
              Reset to defaults
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
