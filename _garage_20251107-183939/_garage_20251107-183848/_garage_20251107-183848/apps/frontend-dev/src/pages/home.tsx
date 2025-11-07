import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly impact: 'high' | 'medium' | 'low';
}

const foundationMilestones: Milestone[] = [
  {
    id: 'routing-basics',
    title: 'Routing baseline established',
    description: 'Wouter router configured with explicit route manifest and 404 handling.',
    impact: 'high',
  },
  {
    id: 'settings-surface',
    title: 'Settings primitives live',
    description: 'Introduced configuration form to validate domain objects and persistence strategy.',
    impact: 'high',
  },
  {
    id: 'ui-system',
    title: 'UI system primitives',
    description: 'Buttons, cards, and layout shell defined without depending on Tailwind runtime.',
    impact: 'medium',
  },
  {
    id: 'roadmap-tracking',
    title: 'Roadmap tracking',
    description: 'Feature readiness captured with local state to document rebuild progress.',
    impact: 'medium',
  },
];

const dailyMetrics = [
  { label: 'Active rebuild streams', value: 2 },
  { label: 'Completed milestones', value: 3 },
  { label: 'Upcoming reviews', value: 1 },
];

const impactCopy: Record<Milestone['impact'], string> = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
};

export function HomePage() {
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({
    'routing-basics': true,
    'settings-surface': true,
    'ui-system': true,
    'roadmap-tracking': false,
  });

  const completionRate = useMemo(() => {
    const total = foundationMilestones.length;
    const completed = foundationMilestones.filter((item) => completedMilestones[item.id]).length;
    return Math.round((completed / total) * 100);
  }, [completedMilestones]);

  const toggleMilestone = (milestoneId: string) => {
    setCompletedMilestones((current) => ({ ...current, [milestoneId]: !current[milestoneId] }));
  };

  return (
    <div className="stack" aria-labelledby="home-heading">
      <header className="page-header">
        <div>
          <p className="app-header__badge" aria-live="polite">
            {completionRate}% core readiness
          </p>
          <h2 id="home-heading" className="app-header__title">
            Development workspace overview
          </h2>
        </div>
        <p className="app-header__subtitle">
          The development path isolates the minimum viable flows so the team can rebuild Autolytiq feature-by-feature
          without breaking production.
        </p>
      </header>

      <section className="card-grid" aria-label="Daily metrics">
        {dailyMetrics.map((metric) => (
          <Card key={metric.label}>
            <div className="metric" role="group" aria-label={metric.label}>
              <span className="metric__label">{metric.label}</span>
              <span className="metric__value">{metric.value}</span>
            </div>
          </Card>
        ))}
      </section>

      <Card title="Milestones tracked locally">
        <p>
          These tasks describe the core scaffolding needed before reintroducing finance, CRM, or analytics features.
          Each toggle updates local state so designers and engineers can quickly demo progress.
        </p>
        <div className="checklist" role="list">
          {foundationMilestones.map((milestone) => {
            const isComplete = completedMilestones[milestone.id];
            return (
              <div
                key={milestone.id}
                className="checklist__item"
                role="listitem"
                data-state={isComplete ? 'complete' : 'pending'}
                aria-live="polite"
              >
                <div>
                  <strong>{milestone.title}</strong>
                  <div>{milestone.description}</div>
                  <small>{impactCopy[milestone.impact]}</small>
                </div>
                <Button
                  variant={isComplete ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleMilestone(milestone.id)}
                  aria-pressed={isComplete}
                >
                  {isComplete ? 'Mark incomplete' : 'Mark complete'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Why a separate development path?">
        <p>
          Production remains untouched so customers continue receiving the full Autolytiq experience. This stripped
          environment provides a safe sandbox to rebuild UI flows, validate domain models, and layer back integrations
          methodically.
        </p>
        <p>
          Once a feature is proven here, it can be promoted into the production tree with confidence, keeping the main
          application stable while still shipping improvements.
        </p>
      </Card>
    </div>
  );
}
