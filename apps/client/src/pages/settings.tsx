import { useEffect, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useLocation } from 'wouter';
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
import SystemSettings from '@/pages/admin/system-settings';
import DealerConfiguration from '@/pages/admin/dealer-configuration';
import CommunicationSettings from '@/pages/admin/communication-settings';
import ComprehensiveSettings from '@/pages/admin/comprehensive-settings';
import UserProfile from '@/pages/admin/user-profile';
import LeadDistribution from '@/pages/admin/lead-distribution';
import SystemConfiguration from '@/pages/admin/system-configuration';
import UserManagement from '@/pages/admin/user-management';

const DEFAULT_SECTION = 'dealership';

const SECTION_COMPONENTS: Record<string, ComponentType<any>> = {
  dealership: DealershipSettings,
  users: UsersSettings,
  pricing: PricingRulesSettings,
  forms: FormsSettings,
  notifications: NotificationsSettings,
  security: SecuritySettings,
  branding: BrandingSettings,
  integrations: IntegrationsSettings,
  data: DataSettings,
  analytics: AnalyticsSettings,
  developer: DeveloperSettings,
  profile: UserProfile,
  preferences: SystemSettings,
  'dealer-config': DealerConfiguration,
  communications: CommunicationSettings,
  enterprise: ComprehensiveSettings,
  'lead-distribution': LeadDistribution,
  'system-configuration': SystemConfiguration,
  'user-management': UserManagement,
};

const PATH_ALIASES: Record<string, keyof typeof SECTION_COMPONENTS> = {
  '/settings': DEFAULT_SECTION,
  '/settings/': DEFAULT_SECTION,
  '/settings/dashboard': 'dealership',
  '/admin/settings': 'preferences',
  '/admin/system-settings': 'preferences',
  '/admin/dealer-configuration': 'dealer-config',
  '/admin/comprehensive-settings': 'enterprise',
  '/admin/dealership': 'enterprise',
  '/admin/communication-settings': 'communications',
  '/admin/security': 'security',
  '/admin/security-center': 'security',
  '/admin/user-profile': 'profile',
  '/admin/lead-distribution': 'lead-distribution',
  '/admin/system-configuration': 'system-configuration',
  '/admin/integrations': 'integrations',
  '/admin/user-management': 'user-management',
};

function resolveSectionFromLocation(location: string): keyof typeof SECTION_COMPONENTS {
  if (PATH_ALIASES[location]) {
    return PATH_ALIASES[location];
  }

  if (location.startsWith('/settings/')) {
    const segment = location.slice('/settings/'.length).split('/')[0];
    if (segment && SECTION_COMPONENTS[segment]) {
      return segment as keyof typeof SECTION_COMPONENTS;
    }
  }

  return DEFAULT_SECTION;
}

export default function Settings(): JSX.Element {
  const [location, setLocation] = useLocation();

  const section = useMemo(() => resolveSectionFromLocation(location), [location]);

  useEffect(() => {
    const aliasSection = PATH_ALIASES[location];
    if (aliasSection && location !== `/settings/${aliasSection}`) {
      setLocation(`/settings/${aliasSection}`);
      return;
    }

    if (location === '/settings' || location === '/settings/') {
      setLocation(`/settings/${DEFAULT_SECTION}`);
      return;
    }

    if (location.startsWith('/settings/')) {
      const segment = location.slice('/settings/'.length).split('/')[0];
      if (!segment || !SECTION_COMPONENTS[segment]) {
        setLocation(`/settings/${DEFAULT_SECTION}`);
      }
    }
  }, [location, setLocation]);

  const ActiveSection = SECTION_COMPONENTS[section] ?? SECTION_COMPONENTS[DEFAULT_SECTION];

  return (
    <SettingsLayout>
      <ActiveSection />
    </SettingsLayout>
  );
}
