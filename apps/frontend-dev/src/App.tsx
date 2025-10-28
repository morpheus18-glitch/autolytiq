import { Route, Switch } from 'wouter';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { appRoutes } from '@/routes';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { SettingsPage } from '@/pages/settings';

export function App() {
  return (
    <AppShell routes={appRoutes}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route>
          {() => (
            <Card title="Route not found">
              <NotFoundPage />
            </Card>
          )}
        </Route>
      </Switch>
    </AppShell>
  );
}
