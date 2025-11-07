import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';
import { useToast } from '@repo/ui';
import { apiRequest } from '@/lib/queryClient';
import {
  FileText,
  Plus,
  Search,
  Download,
  Upload,
  CheckCircle,
  Clock,
  Eye,
  Send,
  Paperclip,
  User,
  Car,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight,
  Edit
} from 'lucide-react';

interface DealJacket {
  id: number;
  dealNumber: string;
  customerName: string;
  vehicle: string;
  status: 'draft' | 'pending' | 'submitted' | 'approved' | 'funded' | 'archived';
  amount: number;
  lender: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  documents: DealDocument[];
}

interface DealDocument {
  id: number;
  name: string;
  type: string;
  status: 'missing' | 'pending' | 'complete';
  uploadedAt?: string;
  uploadedBy?: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Edit },
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Send },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  funded: { label: 'Funded', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: DollarSign },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: FileText },
};

const demoJackets: DealJacket[] = [
  {
    id: 1,
    dealNumber: 'DJ-2024-001',
    customerName: 'John Smith',
    vehicle: '2024 Toyota Camry XLE',
    status: 'submitted',
    amount: 35000,
    lender: 'Chase Auto Finance',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-04T14:30:00Z',
    submittedAt: '2024-11-04T14:30:00Z',
    documents: [
      { id: 1, name: 'Credit Application', type: 'application', status: 'complete', uploadedAt: '2024-11-01T10:05:00Z', uploadedBy: 'Sales Rep' },
      { id: 2, name: 'Proof of Income', type: 'income', status: 'complete', uploadedAt: '2024-11-01T11:00:00Z', uploadedBy: 'Customer' },
      { id: 3, name: 'Insurance Certificate', type: 'insurance', status: 'complete', uploadedAt: '2024-11-04T13:00:00Z', uploadedBy: 'Insurance Agent' },
      { id: 4, name: 'Purchase Agreement', type: 'contract', status: 'complete', uploadedAt: '2024-11-04T14:00:00Z', uploadedBy: 'F&I Manager' },
      { id: 5, name: 'Trade-In Appraisal', type: 'other', status: 'pending' },
    ],
  },
  {
    id: 2,
    dealNumber: 'DJ-2024-002',
    customerName: 'Sarah Johnson',
    vehicle: '2024 Honda Accord Sport',
    status: 'approved',
    amount: 32500,
    lender: 'Wells Fargo Auto',
    createdAt: '2024-11-02T09:00:00Z',
    updatedAt: '2024-11-04T10:00:00Z',
    submittedAt: '2024-11-03T16:00:00Z',
    documents: [
      { id: 6, name: 'Credit Application', type: 'application', status: 'complete' },
      { id: 7, name: 'Proof of Income', type: 'income', status: 'complete' },
      { id: 8, name: 'Insurance Certificate', type: 'insurance', status: 'complete' },
      { id: 9, name: 'Purchase Agreement', type: 'contract', status: 'complete' },
    ],
  },
  {
    id: 3,
    dealNumber: 'DJ-2024-003',
    customerName: 'Michael Chen',
    vehicle: '2024 Ford F-150 Lariat',
    status: 'pending',
    amount: 52000,
    lender: 'Ford Motor Credit',
    createdAt: '2024-11-04T08:00:00Z',
    updatedAt: '2024-11-04T15:20:00Z',
    documents: [
      { id: 10, name: 'Credit Application', type: 'application', status: 'complete' },
      { id: 11, name: 'Proof of Income', type: 'income', status: 'pending' },
      { id: 12, name: 'Insurance Certificate', type: 'insurance', status: 'missing' },
    ],
  },
];

export default function DealJackets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJacket, setSelectedJacket] = useState<DealJacket | null>(null);

  const { data: jackets = demoJackets, isLoading } = useQuery<DealJacket[]>({
    queryKey: ['/api/fi/deal-jackets'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/fi/deal-jackets');
      } catch {
        return demoJackets;
      }
    },
  });

  const filteredJackets = jackets.filter(jacket => {
    const matchesSearch = jacket.dealNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jacket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jacket.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || jacket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jackets.length,
    submitted: jackets.filter(j => j.status === 'submitted').length,
    approved: jackets.filter(j => j.status === 'approved').length,
    funded: jackets.filter(j => j.status === 'funded').length,
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Digital Deal Jackets</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage and track all finance deal documentation</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Deal Jacket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Jackets</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Submitted</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.submitted}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Funded</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.funded}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by deal number, customer, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="funded">Funded</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredJackets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">No deal jackets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJackets.map((jacket) => {
            const StatusIcon = statusConfig[jacket.status].icon;
            const completedDocs = jacket.documents.filter(d => d.status === 'complete').length;
            const totalDocs = jacket.documents.length;

            return (
              <Card key={jacket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedJacket(jacket)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{jacket.dealNumber}</h3>
                        <Badge className={statusConfig[jacket.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[jacket.status].label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-700 dark:text-neutral-300">{jacket.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-700 dark:text-neutral-300">{jacket.vehicle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-700 dark:text-neutral-300">{jacket.lender}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-neutral-500" />
                          <span className="font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(jacket.amount)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Paperclip className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {completedDocs}/{totalDocs} documents
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-700 dark:text-neutral-300">{formatDate(jacket.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedJacket && (
        <Dialog open={!!selectedJacket} onOpenChange={() => setSelectedJacket(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedJacket.dealNumber}</span>
                <Badge className={statusConfig[selectedJacket.status].color}>
                  {statusConfig[selectedJacket.status].label}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Customer</label>
                  <p className="mt-1 text-neutral-900 dark:text-neutral-50">{selectedJacket.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Vehicle</label>
                  <p className="mt-1 text-neutral-900 dark:text-neutral-50">{selectedJacket.vehicle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Lender</label>
                  <p className="mt-1 text-neutral-900 dark:text-neutral-50">{selectedJacket.lender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Amount</label>
                  <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(selectedJacket.amount)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Documents</h3>
                <div className="space-y-2">
                  {selectedJacket.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-neutral-500" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-50">{doc.name}</p>
                          {doc.uploadedBy && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Uploaded by {doc.uploadedBy} {doc.uploadedAt && `on ${formatDate(doc.uploadedAt)}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        doc.status === 'complete' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }>
                        {doc.status === 'complete' ? 'Complete' : doc.status === 'pending' ? 'Pending' : 'Missing'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Submit to Lender
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
