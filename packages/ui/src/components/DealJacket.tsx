/**
 * DealJacket - Digital Deal Jacket with Document Management
 *
 * The complete digital deal folder containing all documents,
 * forms, signatures, and state tracking for an automotive deal.
 *
 * Features:
 * - Document upload/download/preview
 * - E-signature integration
 * - State machine workflow (draft → submitted → approved → funded)
 * - Required document checklist
 * - Compliance verification
 * - Audit trail
 * - Print-ready packet generation
 *
 * Perfect for: F&I, Deal desking, Compliance, Archiving
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import {
  FileText,
  Upload,
  Download,
  Check,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from './Button.js';
import { Badge } from './Badge.js';
import { Progress } from './Progress.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type DealJacketStatus =
  | 'draft'
  | 'pending_signatures'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'funded'
  | 'rejected'
  | 'cancelled';

export type DocumentType =
  | 'buyers_order'
  | 'credit_app'
  | 'drivers_license'
  | 'insurance_card'
  | 'trade_title'
  | 'trade_payoff'
  | 'finance_contract'
  | 'warranty_contract'
  | 'aftermarket_contract'
  | 'odometer_disclosure'
  | 'title_application'
  | 'registration_docs'
  | 'other';

export type DocumentStatus = 'pending' | 'uploaded' | 'signed' | 'verified' | 'rejected';

export interface DealDocument {
  id: string;
  type: DocumentType;
  label: string;
  required: boolean;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number; // bytes
  uploadedBy?: string;
  uploadedAt?: Date;
  signedBy?: string[];
  signedAt?: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  version?: number;
}

export interface DealJacketData {
  dealId: string;
  dealNumber: string;
  customerName: string;
  vehicleDescription: string;
  status: DealJacketStatus;
  createdAt: Date;
  updatedAt: Date;
  documents: DealDocument[];
  signatures: {
    customer: boolean;
    cobuyer?: boolean;
    salesPerson: boolean;
    manager: boolean;
    fiManager?: boolean;
  };
  complianceChecks: {
    id: string;
    label: string;
    status: 'pending' | 'passed' | 'failed';
    message?: string;
  }[];
  auditTrail: {
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    details?: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface DealJacketProps {
  data: DealJacketData;
  onDocumentUpload?: (docType: DocumentType, file: File) => Promise<void>;
  onDocumentDownload?: (document: DealDocument) => void;
  onDocumentPreview?: (document: DealDocument) => void;
  onDocumentDelete?: (documentId: string) => void;
  onSignatureRequest?: (signers: string[]) => void;
  onStatusChange?: (newStatus: DealJacketStatus) => void;
  onPrintPacket?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const DealJacket: React.FC<DealJacketProps> = ({
  data,
  onDocumentUpload,
  onDocumentDownload,
  onDocumentPreview,
  onDocumentDelete,
  onSignatureRequest,
  onStatusChange,
  onPrintPacket,
  readOnly = false,
  className,
}) => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [activeTab, setActiveTab] = React.useState<'documents' | 'compliance' | 'audit'>(
    'documents'
  );
  const [uploadingDocs, setUploadingDocs] = React.useState<Set<string>>(new Set());

  // ═══════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════

  const totalDocuments = data.documents.length;
  const requiredDocuments = data.documents.filter((d) => d.required).length;
  const uploadedDocuments = data.documents.filter(
    (d) => d.status !== 'pending' && d.status !== 'rejected'
  ).length;
  const signedDocuments = data.documents.filter((d) => d.status === 'signed').length;
  const completionPercentage = totalDocuments > 0 ? (uploadedDocuments / totalDocuments) * 100 : 0;

  const getStatusColor = (status: DealJacketStatus): string => {
    switch (status) {
      case 'draft':
        return 'text-text-secondary';
      case 'pending_signatures':
        return 'text-status-warning';
      case 'submitted':
      case 'in_review':
        return 'text-accent-primary';
      case 'approved':
      case 'funded':
        return 'text-status-success';
      case 'rejected':
      case 'cancelled':
        return 'text-status-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusLabel = (status: DealJacketStatus): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDocumentStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-text-tertiary" />;
      case 'uploaded':
        return <CheckCircle className="w-4 h-4 text-accent-primary" />;
      case 'signed':
        return <Lock className="w-4 h-4 text-status-success" />;
      case 'verified':
        return <Check className="w-4 h-4 text-status-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-status-error" />;
      default:
        return <Clock className="w-4 h-4 text-text-tertiary" />;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleFileUpload = async (docType: DocumentType, file: File) => {
    if (!onDocumentUpload) return;

    setUploadingDocs((prev) => new Set([...prev, docType]));
    try {
      await onDocumentUpload(docType, file);
    } finally {
      setUploadingDocs((prev) => {
        const next = new Set(prev);
        next.delete(docType);
        return next;
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className={cn('flex flex-col h-full bg-surface-base rounded-lg border border-border-base', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-elevated">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text-primary">Deal Jacket</h2>
            <Badge variant="outline">{data.dealNumber}</Badge>
            <div className={cn('flex items-center gap-1.5 text-sm font-medium', getStatusColor(data.status))}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {getStatusLabel(data.status)}
            </div>
          </div>
          <div className="mt-1 text-sm text-text-secondary">
            {data.customerName} • {data.vehicleDescription}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={onPrintPacket}>
                <Printer className="w-4 h-4" />
                Print Packet
              </Button>
              {data.status === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onStatusChange?.('submitted')}
                  disabled={completionPercentage < 100}
                >
                  Submit for Review
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-border-base bg-surface-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            Completion: {uploadedDocuments} / {totalDocuments} documents
          </span>
          <span className="text-sm text-text-secondary">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-base bg-surface-elevated">
        <button
          onClick={() => setActiveTab('documents')}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors border-b-2',
            activeTab === 'documents'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Documents ({totalDocuments})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors border-b-2',
            activeTab === 'compliance'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Compliance ({data.complianceChecks.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors border-b-2',
            activeTab === 'audit'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Audit Trail ({data.auditTrail.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'documents' && (
          <div className="space-y-3">
            {data.documents.map((doc) => {
              const isUploading = uploadingDocs.has(doc.type);

              return (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg border transition-colors',
                    doc.status === 'verified'
                      ? 'border-status-success/20 bg-status-success/5'
                      : doc.status === 'rejected'
                      ? 'border-status-error/20 bg-status-error/5'
                      : 'border-border-base bg-surface-elevated hover:bg-surface-subtle'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getDocumentStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{doc.label}</span>
                        {doc.required && <Badge variant="outline" size="sm">Required</Badge>}
                        {doc.version && doc.version > 1 && (
                          <Badge variant="outline" size="sm">v{doc.version}</Badge>
                        )}
                      </div>
                      {doc.fileName && (
                        <div className="mt-0.5 text-xs text-text-tertiary">
                          {doc.fileName} • {((doc.fileSize || 0) / 1024).toFixed(1)} KB
                          {doc.uploadedBy && ` • Uploaded by ${doc.uploadedBy}`}
                        </div>
                      )}
                      {doc.rejectionReason && (
                        <div className="mt-1 text-xs text-status-error">{doc.rejectionReason}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'pending' && !readOnly && (
                      <label>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.type, file);
                          }}
                          disabled={isUploading}
                        />
                        <Button variant="outline" size="sm" disabled={isUploading} asChild>
                          <span>
                            <Upload className="w-4 h-4" />
                            {isUploading ? 'Uploading...' : 'Upload'}
                          </span>
                        </Button>
                      </label>
                    )}

                    {doc.fileUrl && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDocumentPreview?.(doc)}
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDocumentDownload?.(doc)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {doc.status === 'uploaded' && !readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSignatureRequest?.([data.customerName])}
                      >
                        <Unlock className="w-4 h-4" />
                        Request Signature
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-3">
            {data.complianceChecks.map((check) => (
              <div
                key={check.id}
                className={cn(
                  'flex items-start justify-between px-4 py-3 rounded-lg border',
                  check.status === 'passed'
                    ? 'border-status-success/20 bg-status-success/5'
                    : check.status === 'failed'
                    ? 'border-status-error/20 bg-status-error/5'
                    : 'border-border-base bg-surface-elevated'
                )}
              >
                <div className="flex items-start gap-3">
                  {check.status === 'passed' && <CheckCircle className="w-5 h-5 text-status-success mt-0.5" />}
                  {check.status === 'failed' && <XCircle className="w-5 h-5 text-status-error mt-0.5" />}
                  {check.status === 'pending' && <Clock className="w-5 h-5 text-text-tertiary mt-0.5" />}

                  <div>
                    <div className="text-sm font-medium text-text-primary">{check.label}</div>
                    {check.message && (
                      <div className="mt-1 text-xs text-text-secondary">{check.message}</div>
                    )}
                  </div>
                </div>

                <Badge
                  variant={check.status === 'passed' ? 'success' : check.status === 'failed' ? 'error' : 'default'}
                  size="sm"
                >
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-2">
            {data.auditTrail
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg bg-surface-elevated border border-border-base"
                >
                  <User className="w-4 h-4 text-text-tertiary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{entry.user}</span>
                      <span className="text-xs text-text-tertiary">
                        {entry.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm text-text-secondary">{entry.action}</div>
                    {entry.details && (
                      <div className="mt-1 text-xs text-text-tertiary">{entry.details}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Signature Status Footer */}
      <div className="px-6 py-4 border-t border-border-base bg-surface-elevated">
        <div className="text-xs font-medium text-text-secondary uppercase mb-2">Signatures</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            {data.signatures.customer ? (
              <CheckCircle className="w-4 h-4 text-status-success" />
            ) : (
              <Clock className="w-4 h-4 text-text-tertiary" />
            )}
            <span className="text-sm text-text-primary">Customer</span>
          </div>
          {data.signatures.cobuyer !== undefined && (
            <div className="flex items-center gap-1.5">
              {data.signatures.cobuyer ? (
                <CheckCircle className="w-4 h-4 text-status-success" />
              ) : (
                <Clock className="w-4 h-4 text-text-tertiary" />
              )}
              <span className="text-sm text-text-primary">Co-Buyer</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {data.signatures.salesPerson ? (
              <CheckCircle className="w-4 h-4 text-status-success" />
            ) : (
              <Clock className="w-4 h-4 text-text-tertiary" />
            )}
            <span className="text-sm text-text-primary">Salesperson</span>
          </div>
          <div className="flex items-center gap-1.5">
            {data.signatures.manager ? (
              <CheckCircle className="w-4 h-4 text-status-success" />
            ) : (
              <Clock className="w-4 h-4 text-text-tertiary" />
            )}
            <span className="text-sm text-text-primary">Manager</span>
          </div>
          {data.signatures.fiManager !== undefined && (
            <div className="flex items-center gap-1.5">
              {data.signatures.fiManager ? (
                <CheckCircle className="w-4 h-4 text-status-success" />
              ) : (
                <Clock className="w-4 h-4 text-text-tertiary" />
              )}
              <span className="text-sm text-text-primary">F&I Manager</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DealJacket.displayName = 'DealJacket';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const getRequiredDocumentsForDealType = (dealType: 'cash' | 'finance' | 'lease'): DocumentType[] => {
  const common: DocumentType[] = [
    'buyers_order',
    'drivers_license',
    'insurance_card',
    'odometer_disclosure',
  ];

  if (dealType === 'finance' || dealType === 'lease') {
    return [...common, 'credit_app', 'finance_contract'];
  }

  return common;
};

export const calculateDocumentCompletionScore = (documents: DealDocument[]): number => {
  const requiredDocs = documents.filter((d) => d.required);
  if (requiredDocs.length === 0) return 100;

  const completedRequired = requiredDocs.filter(
    (d) => d.status === 'verified' || d.status === 'signed'
  ).length;

  return (completedRequired / requiredDocs.length) * 100;
};
