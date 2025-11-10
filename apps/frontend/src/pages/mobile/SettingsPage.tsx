import { Switch, Bell, Moon, Users, ChevronRight, Text } from '@repo/ui';
import { useState } from 'react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-bg-0">
      {/* iOS-style large title header */}
      <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
        <div className="px-4 pt-4 pb-3">
          <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
            Settings
          </Text>
          <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
            Preferences and account
          </Text>
        </div>
        <div className="h-px bg-border-base/20" />
      </div>

      {/* Profile section */}
      <div className="px-4 py-6">
        <div className="bg-bg-1 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <Text as="h3" variant="bodySemibold" color="primary">
              John Doe
            </Text>
            <Text variant="subheadline" color="secondary" className="opacity-80">
              Sales Associate
            </Text>
            <div className="mt-1">
              <Text as="span" variant="footnoteSemibold" className="text-green-500">● Active</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences section */}
      <div className="px-4 py-2">
        <Text as="h2" variant="footnoteSemibold" color="secondary" className="opacity-70 uppercase tracking-wide px-4 mb-2">
          Preferences
        </Text>

        <div className="bg-bg-1 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 min-h-[60px] flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-text-1" />
            </div>
            <div className="flex-1 min-w-0">
              <Text variant="bodySemibold" color="primary">
                Notifications
              </Text>
              <Text variant="footnote" color="secondary" className="opacity-70">
                Push notifications
              </Text>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="h-px bg-border-base/20 ml-[46px]" />

          <div className="px-4 py-3 min-h-[60px] flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5 text-text-1" />
            </div>
            <div className="flex-1 min-w-0">
              <Text variant="bodySemibold" color="primary">
                Dark Mode
              </Text>
              <Text variant="footnote" color="secondary" className="opacity-70">
                System default
              </Text>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>
      </div>

      {/* Account section */}
      <div className="px-4 py-6">
        <Text as="h2" variant="footnoteSemibold" color="secondary" className="opacity-70 uppercase tracking-wide px-4 mb-2">
          Account
        </Text>

        <div className="bg-bg-1 rounded-2xl overflow-hidden">
          <button className="w-full px-4 py-3 min-h-[60px] flex items-center gap-3 active:bg-bg-2/50 transition-colors">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-text-1" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <Text variant="bodySemibold" color="primary">
                Team
              </Text>
              <Text variant="footnote" color="secondary" className="opacity-70">
                Downtown Auto Sales
              </Text>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
          </button>
          <div className="h-px bg-border-base/20 ml-[46px]" />

          <button className="w-full px-4 py-3 min-h-[60px] flex items-center gap-3 active:bg-bg-2/50 transition-colors">
            <div className="flex-1 min-w-0 text-left pl-[34px]">
              <Text variant="bodySemibold" color="primary">
                Privacy & Security
              </Text>
              <Text variant="footnote" color="secondary" className="opacity-70">
                Manage your data
              </Text>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
          </button>
          <div className="h-px bg-border-base/20 ml-[46px]" />

          <button className="w-full px-4 py-3 min-h-[60px] flex items-center gap-3 active:bg-bg-2/50 transition-colors">
            <div className="flex-1 min-w-0 text-left pl-[34px]">
              <Text variant="bodySemibold" color="primary">
                Help & Support
              </Text>
              <Text variant="footnote" color="secondary" className="opacity-70">
                Get help or send feedback
              </Text>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Version info */}
      <div className="text-center py-8">
        <Text variant="footnote" color="secondary" className="opacity-50">
          AutolytiQ v1.0.0 • Build 2025.11.09
        </Text>
      </div>
    </div>
  );
}
