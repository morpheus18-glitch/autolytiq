import { Link } from 'wouter';
import {
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Send,
  Inbox,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function CommunicationsOverview() {
  const stats = [
    {
      label: 'Unread Messages',
      value: 12,
      icon: MessageCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending Calls',
      value: 5,
      icon: Phone,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Emails Today',
      value: 34,
      icon: Mail,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Response Time',
      value: '1.2h',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const communicationChannels = [
    {
      title: 'Communication Center',
      description: 'Unified inbox for all messages',
      icon: MessageSquare,
      href: '/communications/center',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      badge: '12 new',
    },
    {
      title: 'Call Center',
      description: 'Make and manage phone calls',
      icon: Phone,
      href: '/communications/call-center',
      color: 'text-green-600',
      bg: 'bg-green-50',
      badge: '5 pending',
    },
    {
      title: 'Email Composer',
      description: 'Send emails to customers',
      icon: Mail,
      href: '/communications/email',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      badge: null,
    },
    {
      title: 'SMS Inbox',
      description: 'Text messaging with customers',
      icon: MessageCircle,
      href: '/communications/sms',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badge: '8 new',
    },
    {
      title: 'Communication Demo',
      description: 'Interactive communication demo',
      icon: Users,
      href: '/communications/demo',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      badge: null,
    },
  ];

  const recentMessages = [
    {
      customer: 'Sarah Williams',
      channel: 'SMS',
      message: 'When can I schedule a test drive?',
      time: '5 min ago',
      status: 'unread',
    },
    {
      customer: 'John Smith',
      channel: 'Email',
      message: 'Question about financing options',
      time: '15 min ago',
      status: 'unread',
    },
    {
      customer: 'Emily Davis',
      channel: 'Phone',
      message: 'Missed call - wants callback',
      time: '30 min ago',
      status: 'pending',
    },
    {
      customer: 'Michael Brown',
      channel: 'SMS',
      message: 'Thanks for the quote!',
      time: '1 hour ago',
      status: 'read',
    },
  ];

  const pendingActions = [
    {
      title: 'Follow up with 3 warm leads',
      priority: 'high',
      dueTime: 'By 5:00 PM today',
    },
    {
      title: 'Respond to 5 pending SMS messages',
      priority: 'high',
      dueTime: 'Within 30 minutes',
    },
    {
      title: 'Return missed calls',
      priority: 'medium',
      dueTime: 'By end of day',
    },
    {
      title: 'Send appointment reminders',
      priority: 'low',
      dueTime: 'Tomorrow morning',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communications Center</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all customer communications in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Communication Channels */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {communicationChannels.map((channel, idx) => {
                const Icon = channel.icon;
                return (
                  <Link key={idx} href={channel.href}>
                    <a className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${channel.bg} shrink-0`}>
                          <Icon className={`w-6 h-6 ${channel.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{channel.title}</h3>
                            {channel.badge && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium shrink-0">
                                {channel.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Recent Messages */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {recentMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      msg.status === 'unread' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{msg.customer}</h3>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {msg.channel}
                          </span>
                          {msg.status === 'unread' && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{msg.message}</p>
                        <p className="text-xs text-gray-500">{msg.time}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0">
                        <Send className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <Link href="/communications/center">
                  <a className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All Messages →
                  </a>
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
            <div className="space-y-4 mb-6">
              {pendingActions.map((action, idx) => {
                const priorityColor =
                  action.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : action.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700';

                const Icon = action.priority === 'high' ? AlertCircle : CheckCircle;
                const iconColor =
                  action.priority === 'high' ? 'text-red-500' : 'text-gray-400';

                return (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{action.dueTime}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor}`}
                        >
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-start gap-3 mb-4">
                <PhoneCall className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Quick Call</h3>
                  <p className="text-sm text-cyan-100">
                    Start a phone call with any customer
                  </p>
                </div>
              </div>
              <Link href="/communications/call-center">
                <a className="block w-full px-4 py-2 bg-white text-cyan-600 text-center rounded-lg font-medium hover:bg-cyan-50 transition-colors">
                  Open Call Center
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
