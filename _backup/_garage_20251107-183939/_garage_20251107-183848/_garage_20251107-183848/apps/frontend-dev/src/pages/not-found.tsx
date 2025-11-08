import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const [, navigate] = useLocation();

  return (
    <div className="stack" role="alert">
      <h2 className="section__title">We could not find that view</h2>
      <p>
        The development workspace only exposes a curated set of routes while features are rebuilt. Choose a supported
        page from the navigation to continue testing flows.
      </p>
      <div className="page-header__actions">
        <Button type="button" onClick={() => navigate('/')}>Return home</Button>
      </div>
    </div>
  );
}
