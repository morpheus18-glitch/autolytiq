import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  FileSignature,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  Eye,
  Edit,
  Copy,
  Trash2,
  Search,
  Filter,
  Plus,
  User,
  Calendar,
  FileCheck,
  XCircle,
  RefreshCw,
  Settings,
  Stamp,
  Shield,
} from 'lucide-react';

// Interfaces
interface Signature {
  id: number;
  signerName: string;
  signerRole: string;
  signedAt?: string;
  ipAddress?: string;
  status: 'pending' | 'signed' | 'declined';
}

interface Contract {
  id: number;
  contractNumber: string;
  dealNumber: string;
  dealJacketId: number;
  customerName: string;
  vehicle: string;
  templateName: string;
  templateId: number;
  status: 'draft' | 'pending_signatures' | 'partially_signed' | 'fully_signed' | 'executed' | 'voided';
  createdAt: string;
  createdBy: string;
  sentAt?: string;
  executedAt?: string;
  expiresAt?: string;
  amount: number;
  signatures: Signature[];
  totalSigners: number;
  signedCount: number;
  documentUrl?: string;
  version: number;
}

interface ContractTemplate {
  id: number;
  name: string;
  category: string;
  description: string;
  fields: number;
  lastUpdated: string;
  isActive: boolean;
}

// Demo data
const demoContracts: Contract[] = [
  {
    id: 1,
    contractNumber: 'CTR-2024-001',
    dealNumber: 'DL-2024-001',
    dealJacketId: 1,
    customerName: 'John Smith',
    vehicle: '2024 Toyota Camry XSE',
    templateName: 'Retail Installment Sales Contract',
    templateId: 1,
    status: 'fully_signed',
    createdAt: '2024-11-04T09:00:00',
    createdBy: 'Sarah Johnson',
    sentAt: '2024-11-04T09:30:00',
    executedAt: '2024-11-04T14:30:00',
    amount: 32500,
    version: 1,
    totalSigners: 3,
    signedCount: 3,
    signatures: [
      {
        id: 1,
        signerName: 'John Smith',
        signerRole: 'Buyer',
        signedAt: '2024-11-04T10:15:00',
        ipAddress: '192.168.1.100',
        status: 'signed',
      },
      {
        id: 2,
        signerName: 'Sarah Johnson',
        signerRole: 'F&I Manager',
        signedAt: '2024-11-04T10:45:00',
        ipAddress: '10.0.0.25',
        status: 'signed',
      },
      {
        id: 3,
        signerName: 'Michael Chen',
        signerRole: 'General Manager',
        signedAt: '2024-11-04T14:30:00',
        ipAddress: '10.0.0.10',
        status: 'signed',
      },
    ],
  },
  {
    id: 2,
    contractNumber: 'CTR-2024-002',
    dealNumber: 'DL-2024-002',
    dealJacketId: 2,
    customerName: 'Emily Davis',
    vehicle: '2023 Honda CR-V EX-L',
    templateName: 'Lease Agreement',
    templateId: 2,
    status: 'partially_signed',
    createdAt: '2024-11-04T11:00:00',
    createdBy: 'Mike Chen',
    sentAt: '2024-11-04T11:30:00',
    expiresAt: '2024-11-11T11:30:00',
    amount: 28900,
    version: 1,
    totalSigners: 3,
    signedCount: 2,
    signatures: [
      {
        id: 4,
        signerName: 'Emily Davis',
        signerRole: 'Lessee',
        signedAt: '2024-11-04T12:00:00',
        ipAddress: '192.168.1.105',
        status: 'signed',
      },
      {
        id: 5,
        signerName: 'Mike Chen',
        signerRole: 'F&I Manager',
        signedAt: '2024-11-04T12:15:00',
        ipAddress: '10.0.0.26',
        status: 'signed',
      },
      {
        id: 6,
        signerName: 'Michael Chen',
        signerRole: 'General Manager',
        status: 'pending',
      },
    ],
  },
  {
    id: 3,
    contractNumber: 'CTR-2024-003',
    dealNumber: 'DL-2024-003',
    dealJacketId: 3,
    customerName: 'Robert Martinez',
    vehicle: '2024 Ford F-150 XLT',
    templateName: 'Extended Warranty Agreement',
    templateId: 3,
    status: 'pending_signatures',
    createdAt: '2024-11-04T13:00:00',
    createdBy: 'Sarah Johnson',
    sentAt: '2024-11-04T13:30:00',
    expiresAt: '2024-11-11T13:30:00',
    amount: 45200,
    version: 1,
    totalSigners: 2,
    signedCount: 0,
    signatures: [
      {
        id: 7,
        signerName: 'Robert Martinez',
        signerRole: 'Buyer',
        status: 'pending',
      },
      {
        id: 8,
        signerName: 'Sarah Johnson',
        signerRole: 'F&I Manager',
        status: 'pending',
      },
    ],
  },
  {
    id: 4,
    contractNumber: 'CTR-2024-004',
    dealNumber: 'DL-2024-004',
    dealJacketId: 4,
    customerName: 'Lisa Anderson',
    vehicle: '2024 Chevrolet Silverado',
    templateName: 'GAP Insurance Agreement',
    templateId: 4,
    status: 'draft',
    createdAt: '2024-11-04T14:00:00',
    createdBy: 'Mike Chen',
    amount: 38750,
    version: 1,
    totalSigners: 2,
    signedCount: 0,
    signatures: [],
  },
];

const demoTemplates: ContractTemplate[] = [
  {
    id: 1,
    name: 'Retail Installment Sales Contract',
    category: 'Finance',
    description: 'Standard retail installment contract for vehicle purchases',
    fields: 45,
    lastUpdated: '2024-10-15T10:00:00',
    isActive: true,
  },
  {
    id: 2,
    name: 'Lease Agreement',
    category: 'Lease',
    description: 'Vehicle lease agreement with standard terms',
    fields: 38,
    lastUpdated: '2024-10-20T14:30:00',
    isActive: true,
  },
  {
    id: 3,
    name: 'Extended Warranty Agreement',
    category: 'F&I Products',
    description: 'Extended vehicle warranty contract',
    fields: 25,
    lastUpdated: '2024-10-10T09:15:00',
    isActive: true,
  },
  {
    id: 4,
    name: 'GAP Insurance Agreement',
    category: 'F&I Products',
    description: 'Guaranteed Asset Protection insurance contract',
    fields: 20,
    lastUpdated: '2024-10-05T11:00:00',
    isActive: true,
  },
];

// Status configuration
const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    icon: Edit,
  },
  pending_signatures: {
    label: 'Pending Signatures',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Clock,
  },
  partially_signed: {
    label: 'Partially Signed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: FileSignature,
  },
  fully_signed: {
    label: 'Fully Signed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  executed: {
    label: 'Executed',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: FileCheck,
  },
  voided: {
    label: 'Voided',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
  },
};

const signatureStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Clock,
  },
  signed: {
    label: 'Signed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
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

const formatShortDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
};

export default function Contracting() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Fetch contracts (demo data for now)
  const { data: contracts = demoContracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      // In production, this would be an API call
      // const response = await fetch('/api/fi/contracts');
      // return response.json();
      return demoContracts;
    },
  });

  // Fetch templates
  const { data: templates = demoTemplates } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      // In production, this would be an API call
      return demoTemplates;
    },
  });

  // Filter contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      searchQuery === '' ||
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.dealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.vehicle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: contracts.length,
    pending: contracts.filter(
      (c) => c.status === 'pending_signatures' || c.status === 'partially_signed'
    ).length,
    signed: contracts.filter((c) => c.status === 'fully_signed' || c.status === 'executed').length,
    draft: contracts.filter((c) => c.status === 'draft').length,
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
          <h1 className="text-3xl font-bold text-foreground">Contracting & E-Signatures</h1>
          <p className="text-muted-foreground mt-1">
            Manage contracts, templates, and electronic signatures
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border text-foreground rounded-lg font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Templates
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Contract
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Signatures</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fully Signed</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.signed}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.draft}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
              <Edit className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Contract Templates</h2>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{template.fields} fields</span>
                    <span className="text-xs">•</span>
                    <span>{formatShortDate(template.lastUpdated)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Edit">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Copy">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by contract number, deal, customer, or vehicle..."
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
              <option value="pending_signatures">Pending Signatures</option>
              <option value="partially_signed">Partially Signed</option>
              <option value="fully_signed">Fully Signed</option>
              <option value="executed">Executed</option>
              <option value="voided">Voided</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No contracts found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first contract'}
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const StatusIcon = statusConfig[contract.status].icon;
            const signatureProgress = (contract.signedCount / contract.totalSigners) * 100;

            return (
              <div
                key={contract.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedContract(contract)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">
                            {contract.contractNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusConfig[contract.status].color
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[contract.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contract.customerName} • {contract.vehicle}
                        </p>
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1">
                          {contract.templateName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{contract.dealNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDate(contract.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{contract.createdBy}</span>
                      </div>
                    </div>

                    {/* Signature progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Signatures</span>
                        <span className="font-medium text-foreground">
                          {contract.signedCount} of {contract.totalSigners}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${signatureProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right section - Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContract(contract);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-foreground font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Download contract:', contract.id);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Download"
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
      {selectedContract && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedContract(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedContract.contractNumber}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedContract.customerName} • {selectedContract.vehicle}
                </p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Template</p>
                  <p className="text-sm text-foreground mt-1">{selectedContract.templateName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusConfig[selectedContract.status].color
                      }`}
                    >
                      {statusConfig[selectedContract.status].label}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {formatCurrency(selectedContract.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deal Number</p>
                  <p className="text-sm text-foreground mt-1">{selectedContract.dealNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDate(selectedContract.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p className="text-sm text-foreground mt-1">{selectedContract.createdBy}</p>
                </div>
              </div>

              {/* Signatures */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Signatures</h3>
                <div className="space-y-3">
                  {selectedContract.signatures.map((signature, index) => {
                    const SigStatusIcon = signatureStatusConfig[signature.status].icon;
                    return (
                      <div
                        key={signature.id}
                        className="bg-background border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {signature.signerName}
                              </h4>
                              <p className="text-sm text-muted-foreground">{signature.signerRole}</p>
                              {signature.signedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Signed {formatDate(signature.signedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              signatureStatusConfig[signature.status].color
                            }`}
                          >
                            <SigStatusIcon className="w-3.5 h-3.5" />
                            {signatureStatusConfig[signature.status].label}
                          </span>
                        </div>
                        {signature.ipAddress && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-3.5 h-3.5" />
                            <span>IP: {signature.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                {selectedContract.status === 'draft' && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-foreground font-medium transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit Contract
                  </button>
                )}
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-foreground font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                {selectedContract.status === 'draft' && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                    <Send className="w-4 h-4" />
                    Send for Signatures
                  </button>
                )}
                {selectedContract.status === 'fully_signed' && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    <Stamp className="w-4 h-4" />
                    Execute Contract
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
