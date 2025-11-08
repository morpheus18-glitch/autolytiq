import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Users,
} from 'lucide-react';

// Interfaces
interface LenderResponse {
  id: number;
  lenderId: number;
  lenderName: string;
  status: 'pending' | 'reviewing' | 'approved' | 'declined' | 'conditional';
  rate?: number;
  term?: number;
  amount?: number;
  conditions?: string[];
  respondedAt?: string;
  notes?: string;
}

interface LenderSubmission {
  id: number;
  dealNumber: string;
  dealJacketId: number;
  customerName: string;
  vehicle: string;
  amount: number;
  submittedAt: string;
  submittedBy: string;
  status: 'draft' | 'pending' | 'reviewing' | 'approved' | 'declined' | 'funded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lenderResponses: LenderResponse[];
  totalResponses: number;
  approvedCount: number;
  declinedCount: number;
  bestRate?: number;
}

// Demo data
const demoSubmissions: LenderSubmission[] = [
  {
    id: 1,
    dealNumber: 'DL-2024-001',
    dealJacketId: 1,
    customerName: 'John Smith',
    vehicle: '2024 Toyota Camry XSE',
    amount: 32500,
    submittedAt: '2024-11-04T09:30:00',
    submittedBy: 'Sarah Johnson',
    status: 'approved',
    priority: 'high',
    totalResponses: 5,
    approvedCount: 3,
    declinedCount: 2,
    bestRate: 4.99,
    lenderResponses: [
      {
        id: 1,
        lenderId: 1,
        lenderName: 'Chase Auto Finance',
        status: 'approved',
        rate: 4.99,
        term: 60,
        amount: 32500,
        respondedAt: '2024-11-04T10:15:00',
        notes: 'Approved at prime rate',
      },
      {
        id: 2,
        lenderId: 2,
        lenderName: 'Wells Fargo Dealer Services',
        status: 'approved',
        rate: 5.49,
        term: 60,
        amount: 32500,
        conditions: ['Proof of income required', 'Down payment minimum $3,000'],
        respondedAt: '2024-11-04T10:45:00',
      },
      {
        id: 3,
        lenderId: 3,
        lenderName: 'Capital One Auto',
        status: 'approved',
        rate: 5.29,
        term: 72,
        amount: 32500,
        respondedAt: '2024-11-04T11:00:00',
      },
      {
        id: 4,
        lenderId: 4,
        lenderName: 'TD Auto Finance',
        status: 'declined',
        respondedAt: '2024-11-04T11:30:00',
        notes: 'Credit score below minimum threshold',
      },
      {
        id: 5,
        lenderId: 5,
        lenderName: 'Bank of America',
        status: 'declined',
        respondedAt: '2024-11-04T12:00:00',
        notes: 'DTI ratio too high',
      },
    ],
  },
  {
    id: 2,
    dealNumber: 'DL-2024-002',
    dealJacketId: 2,
    customerName: 'Emily Davis',
    vehicle: '2023 Honda CR-V EX-L',
    amount: 28900,
    submittedAt: '2024-11-04T11:00:00',
    submittedBy: 'Mike Chen',
    status: 'reviewing',
    priority: 'medium',
    totalResponses: 4,
    approvedCount: 2,
    declinedCount: 0,
    bestRate: 5.49,
    lenderResponses: [
      {
        id: 6,
        lenderId: 1,
        lenderName: 'Chase Auto Finance',
        status: 'approved',
        rate: 5.49,
        term: 60,
        amount: 28900,
        respondedAt: '2024-11-04T11:45:00',
      },
      {
        id: 7,
        lenderId: 2,
        lenderName: 'Wells Fargo Dealer Services',
        status: 'reviewing',
      },
      {
        id: 8,
        lenderId: 3,
        lenderName: 'Capital One Auto',
        status: 'approved',
        rate: 5.99,
        term: 60,
        amount: 28900,
        respondedAt: '2024-11-04T12:15:00',
      },
      {
        id: 9,
        lenderId: 4,
        lenderName: 'TD Auto Finance',
        status: 'pending',
      },
    ],
  },
  {
    id: 3,
    dealNumber: 'DL-2024-003',
    dealJacketId: 3,
    customerName: 'Robert Martinez',
    vehicle: '2024 Ford F-150 XLT',
    amount: 45200,
    submittedAt: '2024-11-04T13:30:00',
    submittedBy: 'Sarah Johnson',
    status: 'pending',
    priority: 'urgent',
    totalResponses: 3,
    approvedCount: 0,
    declinedCount: 0,
    lenderResponses: [
      {
        id: 10,
        lenderId: 1,
        lenderName: 'Chase Auto Finance',
        status: 'pending',
      },
      {
        id: 11,
        lenderId: 2,
        lenderName: 'Wells Fargo Dealer Services',
        status: 'pending',
      },
      {
        id: 12,
        lenderId: 5,
        lenderName: 'Bank of America',
        status: 'pending',
      },
    ],
  },
];

// Status configuration
const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    icon: FileText,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Clock,
  },
  reviewing: {
    label: 'Reviewing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: RefreshCw,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
  },
  funded: {
    label: 'Funded',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: DollarSign,
  },
};

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

const responseStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    icon: Clock,
  },
  reviewing: {
    label: 'Reviewing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Eye,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
  },
  conditional: {
    label: 'Conditional',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: AlertCircle,
  },
};

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
};

const formatRate = (rate: number) => {
  return `${rate.toFixed(2)}%`;
};

export default function LenderSubmissions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<LenderSubmission | null>(null);

  // Fetch submissions (demo data for now)
  const { data: submissions = demoSubmissions, isLoading } = useQuery({
    queryKey: ['lender-submissions'],
    queryFn: async () => {
      // In production, this would be an API call
      // const response = await fetch('/api/fi/lender-submissions');
      // return response.json();
      return demoSubmissions;
    },
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      searchQuery === '' ||
      submission.dealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.vehicle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending' || s.status === 'reviewing').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    avgResponseTime: '2.5 hours',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lender Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Submit deals to lenders and track approval status
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
          <Send className="w-4 h-4" />
          New Submission
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Send className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Review</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.avgResponseTime}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by deal number, customer, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="funded">Funded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No submissions found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first lender submission'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const StatusIcon = statusConfig[submission.status].icon;
            return (
              <div
                key={submission.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {submission.dealNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusConfig[submission.status].color
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[submission.status].label}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              priorityConfig[submission.priority].color
                            }`}
                          >
                            {priorityConfig[submission.priority].label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {submission.customerName} • {submission.vehicle}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-foreground">
                          {formatCurrency(submission.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(submission.submittedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{submission.submittedBy}</span>
                      </div>
                    </div>

                    {/* Lender responses summary */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">
                          {submission.totalResponses} Lenders
                        </span>
                      </div>
                      {submission.approvedCount > 0 && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">{submission.approvedCount} Approved</span>
                        </div>
                      )}
                      {submission.declinedCount > 0 && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">{submission.declinedCount} Declined</span>
                        </div>
                      )}
                      {submission.bestRate && (
                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">
                            Best Rate: {formatRate(submission.bestRate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right section - Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(submission);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-foreground font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Download submission:', submission.id);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Download Submission"
                    >
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedSubmission.dealNumber}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSubmission.customerName} • {selectedSubmission.vehicle}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Submission Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {formatCurrency(selectedSubmission.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusConfig[selectedSubmission.status].color
                      }`}
                    >
                      {statusConfig[selectedSubmission.status].label}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted By</p>
                  <p className="text-sm text-foreground mt-1">{selectedSubmission.submittedBy}</p>
                </div>
              </div>

              {/* Lender Responses */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Lender Responses</h3>
                <div className="space-y-3">
                  {selectedSubmission.lenderResponses.map((response) => {
                    const ResponseIcon = responseStatusConfig[response.status].icon;
                    return (
                      <div
                        key={response.id}
                        className="bg-background border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {response.lenderName}
                              </h4>
                              {response.respondedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Responded {formatDate(response.respondedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              responseStatusConfig[response.status].color
                            }`}
                          >
                            <ResponseIcon className="w-3.5 h-3.5" />
                            {responseStatusConfig[response.status].label}
                          </span>
                        </div>

                        {response.status === 'approved' && (
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            {response.rate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Rate</p>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatRate(response.rate)}
                                </p>
                              </div>
                            )}
                            {response.term && (
                              <div>
                                <p className="text-xs text-muted-foreground">Term</p>
                                <p className="text-sm font-semibold text-foreground">
                                  {response.term} months
                                </p>
                              </div>
                            )}
                            {response.amount && (
                              <div>
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatCurrency(response.amount)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {response.conditions && response.conditions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Conditions:
                            </p>
                            <ul className="space-y-1">
                              {response.conditions.map((condition, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-foreground flex items-start gap-2"
                                >
                                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {response.notes && (
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-sm text-foreground">{response.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-foreground font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Add Note
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-foreground font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                  Accept Best Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
