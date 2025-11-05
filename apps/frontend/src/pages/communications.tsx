import { Link } from 'wouter';
import {
  PageHeader,
  StatCard,
  Card,
  CardContent,
  Badge,
  Button
} from '@repo/ui';
import {
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  PhoneCall
} from 'lucide-react';

export default function CommunicationsOverview() {
  const stats = [
    {
      label: 'Unread Messages',
      value: '12',
      icon: MessageCircle,
    },
    {
      label: 'Pending Calls',
      value: '5',
      icon: Phone,
    },
    {
      label: 'Emails Today',
      value: '34',
      icon: Mail,
    },
    {
      label: 'Response Time',
      value: '1.2h',
      icon: Clock,
    },
  ];

  const communicationChannels = [
    {
      title: 'Communication Center',
      description: 'Unified inbox for all messages',
      icon: MessageSquare,
      href: '/communications/center',
      badge: '12 new',
    },
    {
      title: 'Call Center',
      description: 'Make and manage phone calls',
      icon: Phone,
      href: '/communications/call-center',
      badge: '5 pending',
    },
    {
      title: 'Email Composer',
      description: 'Send emails to customers',
      icon: Mail,
      href: '/communications/email',
      badge: null,
    },
    {
      title: 'SMS Inbox',
      description: 'Text messaging with customers',
      icon: MessageCircle,
      href: '/communications/sms',
      badge: '8 new',
    },
    {
      title: 'Communication Demo',
      description: 'Interactive communication demo',
      icon: Users,
      href: '/communications/demo',
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

  const getPriorityVariant = (priority: string): 'error' | 'warning' | 'default' => {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'warning';
    return 'default';
  };

  return (
    <div>
      <PageHeader
        icon={<MessageSquare className="w-6 h-6" />}
        title="Communications Center"
        description="Manage all customer communications in one place"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            icon={<stat.icon className="w-5 h-5" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Communication Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {communicationChannels.map((channel, idx) => {
              const Icon = channel.icon;
              return (
                <Link key={idx} href={channel.href}>
                  <a className="block no-underline">
                    <Card padding="lg" hover>
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-neutral-100 flex-shrink-0">
                            <Icon className="w-6 h-6 text-neutral-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-bold text-neutral-900">{channel.title}</h3>
                              {channel.badge && (
                                <Badge variant="error">{channel.badge}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600">{channel.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Messages</h2>
          <Card padding="none">
            <CardContent>
              <div className="flex flex-col">
                {recentMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors ${
                      msg.status === 'unread' ? 'bg-info-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-neutral-900 text-sm">
                            {msg.customer}
                          </h3>
                          <Badge variant="default">{msg.channel}</Badge>
                          {msg.status === 'unread' && (
                            <span className="w-2 h-2 bg-info-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-700 mb-1">{msg.message}</p>
                        <p className="text-xs text-neutral-500">{msg.time}</p>
                      </div>
                      <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors flex-shrink-0">
                        <Send className="w-4 h-4 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-neutral-200">
                <Link href="/communications/center">
                  <a className="block w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors no-underline">
                    View All Messages →
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Action Items</h2>
          <div className="flex flex-col gap-4 mb-6">
            {pendingActions.map((action, idx) => {
              const Icon = action.priority === 'high' ? AlertCircle : CheckCircle;
              const iconColor = action.priority === 'high' ? 'text-error-500' : 'text-neutral-400';

              return (
                <Card key={idx} padding="md">
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-neutral-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs text-neutral-600 mb-2">{action.dueTime}</p>
                        <Badge variant={getPriorityVariant(action.priority)}>
                          {action.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <PhoneCall className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Quick Call</h3>
                <p className="text-sm opacity-90">
                  Start a phone call with any customer
                </p>
              </div>
            </div>
            <Link href="/communications/call-center">
              <a className="block w-full px-4 py-2 bg-white text-cyan-500 text-center rounded-lg font-medium hover:bg-blue-50 transition-colors no-underline">
                Open Call Center
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
