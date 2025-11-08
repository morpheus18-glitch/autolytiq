import { useDashboardLayout } from '@/hooks/dashboard/useDashboardLayout';
import { DashboardWidget } from './DashboardWidget';

interface DashboardLayoutProps {
  role: string;
  title: string;
}

export function DashboardLayout({ role, title }: DashboardLayoutProps) {
  const { layout, isLoading, isDefault, isEditing, setIsEditing, resetLayout } = useDashboardLayout(role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isDefault ? 'Using default layout' : 'Custom layout'}
          </p>
        </div>

        <div className="flex gap-3">
          {!isDefault && (
            <button
              onClick={() => resetLayout()}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset to Default
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isEditing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Customize Dashboard'}
          </button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-4 gap-4">
        {layout.widgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            widget={widget}
            isEditing={isEditing}
          />
        ))}
      </div>

      {/* Empty State */}
      {layout.widgets.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No widgets configured</h3>
          <p className="text-gray-500">Click "Customize Dashboard" to add widgets</p>
        </div>
      )}
    </div>
  );
}
