/**
 * Deal Studio Mobile Demo
 *
 * Interactive demo page for testing mobile Deal Studio interface
 * Shows mobile layout with sample data
 */

import { useState } from 'react';
import { DealStudio } from '@/components/deal-studio/DealStudio';
import { Smartphone, Monitor, Eye } from 'lucide-react';

export default function DealStudioMobileDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [forceMobile, setForceMobile] = useState(true);
  const [chatMessage, setChatMessage] = useState<string | null>(null);

  const handlePasteToChat = (message: string) => {
    setChatMessage(message);
    console.log('Deal pasted to chat:', message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Deal Studio Mobile Demo
          </h1>
          <p className="text-sm text-slate-600">
            Interactive preview of mobile Deal Studio interface
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Layout Control */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Preview Settings
              </h2>

              <div className="space-y-4">
                {/* Force Layout */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Force Layout
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setForceMobile(true)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                        forceMobile
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setForceMobile(false)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                        !forceMobile
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>Desktop</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-300/50"
                >
                  Open Deal Studio
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Mobile Features
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Touch-Optimized Controls</div>
                    <div className="text-slate-600">Large touch targets, vertical layout</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Tabbed Interface</div>
                    <div className="text-slate-600">Simulator and AI Coach tabs</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Compact Header</div>
                    <div className="text-slate-600">Customer dossier with expandable details</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Paste to Chat</div>
                    <div className="text-slate-600">One-tap deal sharing to DM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">AI Recommendations</div>
                    <div className="text-slate-600">Strategy cards with talking points</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Live Calculations</div>
                    <div className="text-slate-600">Real-time payment updates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chat Output */}
          <div className="space-y-6">
            {/* Chat Message Preview */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Chat Message Preview
              </h2>

              {chatMessage ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="text-xs font-semibold text-green-700 mb-2">
                    Message ready to send:
                  </div>
                  <div className="text-sm text-slate-900 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-green-200">
                    {chatMessage}
                  </div>
                  <button
                    onClick={() => setChatMessage(null)}
                    className="mt-3 text-xs text-green-600 hover:text-green-700 font-semibold"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-8 text-center border border-dashed border-slate-300">
                  <div className="text-slate-400 text-sm">
                    No message yet. Open Deal Studio and click "Paste to Chat" to see the formatted message here.
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-lg font-bold text-blue-900 mb-4">
                How to Test
              </h2>

              <ol className="space-y-3 text-sm text-blue-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Click "Open Deal Studio" to launch the mobile interface</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Try adjusting deal parameters in the Simulator tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Switch to AI Coach tab to see AI recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Click "Stage This Deal" to load an AI recommendation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>Click "Paste to Chat" to see formatted message output</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">6.</span>
                  <span>Toggle between Mobile/Desktop preview modes</span>
                </li>
              </ol>
            </div>

            {/* Technical Info */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h2 className="text-lg font-bold text-purple-900 mb-3">
                Technical Details
              </h2>

              <div className="space-y-2 text-sm text-purple-900">
                <div className="flex justify-between">
                  <span className="font-semibold">Breakpoint:</span>
                  <span className="font-mono">1024px (lg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Components:</span>
                  <span>6 mobile-specific</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Tabs:</span>
                  <span>Simulator, AI Coach</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Touch Targets:</span>
                  <span>≥ 48px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Studio Modal */}
      <DealStudio
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onPasteToChat={handlePasteToChat}
        forceMobile={forceMobile}
      />
    </div>
  );
}
