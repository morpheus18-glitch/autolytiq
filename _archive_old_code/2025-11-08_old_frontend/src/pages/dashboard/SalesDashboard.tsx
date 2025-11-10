import { useAuth } from '../../contexts/AuthContext';

export default function SalesDashboard() {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Sales Dashboard</h1>
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
            <StatCard
              title="Active Leads"
              value="24"
              change="+12%"
              positive
            />
            <StatCard
              title="Deals in Progress"
              value="8"
              change="+3"
              positive
            />
            <StatCard
              title="Closed This Month"
              value="15"
              change="+25%"
              positive
            />
            <StatCard
              title="Monthly Revenue"
              value="$458K"
              change="+18%"
              positive
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionButton title="New Lead" icon="📝" />
              <ActionButton title="Start Deal" icon="🚗" />
              <ActionButton title="View Inventory" icon="📦" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <ActivityItem
                title="New lead assigned: John Smith"
                time="5 minutes ago"
                type="lead"
              />
              <ActivityItem
                title="Deal closed: 2024 Honda Accord"
                time="1 hour ago"
                type="deal"
              />
              <ActivityItem
                title="Follow-up scheduled with Jane Doe"
                time="2 hours ago"
                type="task"
              />
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
      <p className={`text-sm mt-2 ${positive ? 'text-success-600' : 'text-error-600'}`}>
        {change} from last month
      </p>
    </div>
  );
}

function ActionButton({ title, icon }: { title: string; icon: string }) {
  return (
    <button className="flex items-center gap-3 p-4 border-2 border-neutral-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-neutral-900">{title}</span>
    </button>
  );
}

function ActivityItem({ title, time, type }: {
  title: string;
  time: string;
  type: 'lead' | 'deal' | 'task';
}) {
  const colors = {
    lead: 'bg-blue-100 text-blue-800',
    deal: 'bg-success-100 text-success-800',
    task: 'bg-warning-100 text-warning-800',
  };

  return (
    <div className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${colors[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{time}</p>
      </div>
    </div>
  );
}
