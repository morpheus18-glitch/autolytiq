import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SettingsLayout from '@/pages/settings/SettingsLayout';
import DealershipSettings from '@/pages/settings/DealershipSettings';
import UsersSettings from '@/pages/settings/UsersSettings';
import PricingRulesSettings from '@/pages/settings/PricingRulesSettings';
import FormsSettings from '@/pages/settings/FormsSettings';
import NotificationsSettings from '@/pages/settings/NotificationsSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import IntegrationsSettings from '@/pages/settings/IntegrationsSettings';
import DataSettings from '@/pages/settings/DataSettings';
import AnalyticsSettings from '@/pages/settings/AnalyticsSettings';
import DeveloperSettings from '@/pages/settings/DeveloperSettings';

export default function Settings(): JSX.Element {
  return (
    <BrowserRouter basename="/settings">
      <Routes>
        <Route path="/" element={<SettingsLayout />}>
          <Route index element={<Navigate to="dealership" replace />} />
          <Route path="dealership" element={<DealershipSettings />} />
          <Route path="users" element={<UsersSettings />} />
          <Route path="pricing" element={<PricingRulesSettings />} />
          <Route path="forms" element={<FormsSettings />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="branding" element={<BrandingSettings />} />
          <Route path="integrations" element={<IntegrationsSettings />} />
          <Route path="data" element={<DataSettings />} />
          <Route path="analytics" element={<AnalyticsSettings />} />
          <Route path="developer" element={<DeveloperSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/settings/dealership" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
