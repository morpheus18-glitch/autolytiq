/**
 * Deal Studio Desktop Demo Page
 *
 * Demonstration page for testing the desktop three-panel layout
 * Force desktop mode for testing even on smaller screens
 */

import { useState } from 'react';
import { DealStudio } from '@/components/deal-studio/DealStudio';
import { Layout, Monitor, Smartphone } from 'lucide-react';

export default function DealStudioDesktopDemo() {
  const [isDealStudioOpen, setIsDealStudioOpen] = useState(false);
  const [pastedMessage, setPastedMessage] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'auto' | 'mobile' | 'desktop'>('desktop');

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-base px-8 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Deal Studio - Desktop Demo
        </h1>
        <p className="text-text-secondary">
          Testing the three-panel desktop layout with enhanced color scheme
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Layout Toggle */}
        <div className="bg-surface-base rounded-xl border border-border-base p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Layout className="h-5 w-5 text-accent-primary" />
            Layout Mode
          </h2>
          <div className="flex gap-3">
            <LayoutButton
              mode="auto"
              label="Auto (Responsive)"
              icon={Layout}
              currentMode={layoutMode}
              onClick={() => setLayoutMode('auto')}
            />
            <LayoutButton
              mode="mobile"
              label="Force Mobile"
              icon={Smartphone}
              currentMode={layoutMode}
              onClick={() => setLayoutMode('mobile')}
            />
            <LayoutButton
              mode="desktop"
              label="Force Desktop"
              icon={Monitor}
              currentMode={layoutMode}
              onClick={() => setLayoutMode('desktop')}
            />
          </div>
        </div>

        {/* Launch Button */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 shadow-xl text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Test</h2>
          <p className="text-blue-100 mb-6">
            Click below to launch the desktop Deal Studio with three-panel layout
          </p>
          <button
            onClick={() => setIsDealStudioOpen(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            =€ Open Deal Studio (Desktop)
          </button>
        </div>

        {/* Pasted Message Display */}
        {pastedMessage && (
          <div className="bg-surface-base rounded-xl border border-border-base p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Pasted to Chat
            </h2>
            <div className="bg-surface-muted rounded-lg p-4 font-mono text-sm text-text-secondary whitespace-pre-wrap">
              {pastedMessage}
            </div>
            <button
              onClick={() => setPastedMessage(null)}
              className="mt-4 px-4 py-2 bg-surface-subtle text-text-secondary rounded-lg hover:bg-surface-muted transition-all border border-border-base"
            >
              Clear
            </button>
          </div>
        )}

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard
            title="Left Panel"
            description="Deal structure controls with sliders, term grid, and F&I product toggles"
            icon="<›"
          />
          <FeatureCard
            title="Center Panel"
            description="Live payment display, profit analysis, and comprehensive deal breakdown"
            icon="=Ê"
          />
          <FeatureCard
            title="Right Panel"
            description="Persistent AI Coach with recommendations and deal insights"
            icon=">"
          />
        </div>
      </div>

      {/* Deal Studio Modal */}
      <DealStudio
        open={isDealStudioOpen}
        onClose={() => setIsDealStudioOpen(false)}
        onPasteToChat={(message) => {
          setPastedMessage(message);
          setIsDealStudioOpen(false);
        }}
        forceMobile={layoutMode === 'mobile'}
        forceDesktop={layoutMode === 'desktop'}
      />
    </div>
  );
}

interface LayoutButtonProps {
  mode: 'auto' | 'mobile' | 'desktop';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  currentMode: 'auto' | 'mobile' | 'desktop';
  onClick: () => void;
}

function LayoutButton({ mode, label, icon: Icon, currentMode, onClick }: LayoutButtonProps) {
  const isActive = mode === currentMode;
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-surface-muted text-text-secondary hover:bg-surface-subtle border border-border-base'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-surface-base rounded-xl border border-border-base p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
