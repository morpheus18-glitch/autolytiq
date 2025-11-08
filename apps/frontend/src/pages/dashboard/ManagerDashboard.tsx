import { useAuth } from '../../contexts/AuthContext';

export default function ManagerDashboard() {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Manager Dashboard</h1>
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
            <StatCard title="Team Performance" value="87%" change="+5%" positive />
            <StatCard title="Pending Approvals" value="12" change="-2" positive />
            <StatCard title="Monthly Profit" value="$125K" change="+22%" positive />
            <StatCard title="Team Size" value="8" change="+1" positive />
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Team Overview</h2>
            <div className="space-y-3">
              <TeamMember name="John Doe" role="Salesperson" deals={5} status="active" />
              <TeamMember name="Jane Smith" role="Salesperson" deals={3} status="active" />
              <TeamMember name="Mike Johnson" role="Salesperson" deals={7} status="busy" />
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Pending Actions</h2>
            <div className="space-y-3">
              <ActionItem
                title="Approve deal: 2024 Toyota Camry - $28,500"
                priority="high"
                time="30 minutes ago"
              />
              <ActionItem
                title="Review discount request: Honda CR-V"
                priority="medium"
                time="2 hours ago"
              />
              <ActionItem
                title="Sign off on inventory transfer"
                priority="low"
                time="5 hours ago"
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

function TeamMember({ name, role, deals, status }: {
  name: string;
  role: string;
  deals: number;
  status: 'active' | 'busy';
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
      <div>
        <p className="font-medium text-neutral-900">{name}</p>
        <p className="text-sm text-neutral-600">{role}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-neutral-900">{deals} active deals</p>
        <span
          className={`inline-block px-2 py-1 text-xs rounded ${
            status === 'active'
              ? 'bg-success-100 text-success-800'
              : 'bg-warning-100 text-warning-800'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function ActionItem({ title, priority, time }: {
  title: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
}) {
  const colors = {
    high: 'bg-error-100 text-error-800',
    medium: 'bg-warning-100 text-warning-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{time}</p>
      </div>
      <button className="px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded hover:bg-accent-600">
        Review
      </button>
    </div>
  );
}
