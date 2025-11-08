import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
            <p className="text-sm text-neutral-600 mt-1">
              {tenant?.name} • {user?.firstName || user?.username}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value="45" change="+3" positive />
            <StatCard title="System Health" value="99.8%" change="0%" positive />
            <StatCard title="Active Sessions" value="28" change="+5" positive />
            <StatCard title="Storage Used" value="68%" change="+2%" positive={false} />
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <LogItem
                  action="User created: mike.wilson"
                  user="Admin"
                  time="10 min ago"
                  type="success"
                />
                <LogItem
                  action="Role updated: Sales Manager"
                  user="Admin"
                  time="1 hour ago"
                  type="info"
                />
                <LogItem
                  action="Failed login attempt"
                  user="unknown"
                  time="2 hours ago"
                  type="warning"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Settings</h2>
              <div className="space-y-3">
                <SettingToggle label="Email Notifications" enabled />
                <SettingToggle label="Two-Factor Auth" enabled />
                <SettingToggle label="API Access" enabled={false} />
                <SettingToggle label="Debug Mode" enabled={false} />
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ManagementCard title="Users" count={45} icon="👥" />
              <ManagementCard title="Roles" count={8} icon="🔐" />
              <ManagementCard title="Settings" count={24} icon="⚙️" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, positive }: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>
      <p className={`text-sm mt-2 ${positive ? 'text-success-600' : 'text-warning-600'}`}>
        {change} from last week
      </p>
    </div>
  );
}

function LogItem({ action, user, time, type }: {
  action: string;
  user: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}) {
  const colors = {
    success: 'bg-success-100 text-success-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-warning-100 text-warning-800',
  };

  return (
    <div className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${colors[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{action}</p>
        <p className="text-xs text-neutral-500">{user} • {time}</p>
      </div>
    </div>
  );
}

function SettingToggle({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <div
        className={`w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-accent-500' : 'bg-neutral-300'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </div>
    </div>
  );
}

function ManagementCard({ title, count, icon }: {
  title: string;
  count: number;
  icon: string;
}) {
  return (
    <button className="flex items-center gap-4 p-6 border-2 border-neutral-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-colors">
      <span className="text-3xl">{icon}</span>
      <div className="text-left">
        <p className="text-2xl font-bold text-neutral-900">{count}</p>
        <p className="text-sm text-neutral-600">{title}</p>
      </div>
    </button>
  );
}
