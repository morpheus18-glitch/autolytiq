import { useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
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
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (location === '/settings' || location === '/settings/') {
      setLocation('/settings/dealership');
    }
  }, [location, setLocation]);

  const renderContent = () => {
    if (location === '/settings/dealership') return <DealershipSettings />;
    if (location === '/settings/users') return <UsersSettings />;
    if (location === '/settings/pricing') return <PricingRulesSettings />;
    if (location === '/settings/forms') return <FormsSettings />;
    if (location === '/settings/notifications') return <NotificationsSettings />;
    if (location === '/settings/security') return <SecuritySettings />;
    if (location === '/settings/branding') return <BrandingSettings />;
    if (location === '/settings/integrations') return <IntegrationsSettings />;
    if (location === '/settings/data') return <DataSettings />;
    if (location === '/settings/analytics') return <AnalyticsSettings />;
    if (location === '/settings/developer') return <DeveloperSettings />;
    
    return <Redirect to="/settings/dealership" />;
  };

  return (
    <SettingsLayout>
      {renderContent()}
    </SettingsLayout>
  );
}
