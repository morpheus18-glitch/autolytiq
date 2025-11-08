/**
 * PII Drawer Component
 *
 * Secure drawer for viewing Personally Identifiable Information
 * - Portal mount to document.body
 * - Gated by RoleGuard (requires PII_VIEW permission)
 * - Fetch with cache: "no-store" (never cache PII)
 * - Audit logging on open: POST /api/audit/pii.viewed
 * - Disable copy by default, ESC/backdrop close, focus trap
 */

import { useState, useEffect, useRef } from 'react';
import { X, Eye, Lock, AlertCircle, Copy, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@repo/ui';
import { RoleGuard } from '@repo/ui';
import { cn } from '@/lib/utils';

export interface PIIRecord {
  id: string;
  type: 'customer' | 'deal' | 'lead';
  name: string;
  ssn?: string;
  dob?: string;
  driversLicense?: {
    number: string;
    state: string;
    expiration: string;
  };
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
  };
  creditScore?: number;
  bankAccount?: {
    routingNumber: string;
    accountNumber: string;
    bankName: string;
  };
  employmentInfo?: {
    employer: string;
    position: string;
    monthlyIncome: number;
    yearsEmployed: number;
  };
  references?: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
}

interface PIIDrawerProps {
  /** Whether drawer is open */
  open: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Record ID to fetch PII for */
  recordId: string;
  /** Reason for viewing PII (required for audit) */
  reason: string;
  /** Allow copying PII to clipboard (default: false) */
  allowCopy?: boolean;
}

/**
 * Secure PII Drawer with audit logging and role-based access
 */
export function PIIDrawer({
  open,
  onClose,
  recordId,
  reason,
  allowCopy = false,
}: PIIDrawerProps) {
  const [piiData, setPIIData] = useState<PIIRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogged, setAuditLogged] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch PII data when drawer opens
   * Uses cache: "no-store" to prevent caching sensitive data
   */
  useEffect(() => {
    if (!open || !recordId) {
      setPIIData(null);
      setAuditLogged(false);
      return;
    }

    const fetchPII = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch PII with no-store cache policy
        const response = await fetch(`/api/pii/${recordId}`, {
          method: 'GET',
          cache: 'no-store', // CRITICAL: Never cache PII
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to view PII');
          }
          throw new Error(`Failed to fetch PII: ${response.statusText}`);
        }

        const data: PIIRecord = await response.json();
        setPIIData(data);

        // Log audit event
        if (!auditLogged) {
          await logPIIAccess(recordId, reason);
          setAuditLogged(true);
        }
      } catch (err) {
        console.error('Failed to fetch PII:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch PII');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPII();
  }, [open, recordId, reason, auditLogged]);

  /**
   * Log PII access to audit trail
   * POST /api/audit/pii.viewed
   */
  const logPIIAccess = async (id: string, accessReason: string) => {
    try {
      await fetch('/api/audit/pii.viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: id,
          reason: accessReason,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to log PII access:', err);
      // Don't block UI if audit logging fails
    }
  };

  /**
   * Copy field to clipboard (if enabled)
   */
  const handleCopy = async (field: string, value: string) => {
    if (!allowCopy) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);

      // Log copy event
      await fetch('/api/audit/pii.copied', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId,
          field,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Handle ESC key
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <RoleGuard requiredPermission="PII_VIEW" fallback={<PIIAccessDenied />}>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          ref={drawerRef}
          side="right"
          className="w-full sm:w-[540px] overflow-y-auto"
        >
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              <SheetTitle>Protected Information</SheetTitle>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-surface-subtle transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetHeader>

          {/* Warning Banner */}
          <div className="mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900 dark:text-red-200">
                <p className="font-semibold mb-1">Confidential Information</p>
                <p className="text-xs leading-relaxed">
                  This information is protected under federal and state privacy laws.
                  Unauthorized access, disclosure, or misuse may result in legal action
                  and termination. All access is logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-text-secondary">
                <div className="h-5 w-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading protected information...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* PII Data */}
          {piiData && !isLoading && !error && (
            <div className="mt-6 space-y-6">
              {/* Personal Information */}
              <PIISection title="Personal Information">
                <PIIField
                  label="Full Name"
                  value={piiData.name}
                  allowCopy={allowCopy}
                  copied={copiedField === 'name'}
                  onCopy={() => handleCopy('name', piiData.name)}
                />
                {piiData.ssn && (
                  <PIIField
                    label="Social Security Number"
                    value={formatSSN(piiData.ssn)}
                    sensitive
                    allowCopy={allowCopy}
                    copied={copiedField === 'ssn'}
                    onCopy={() => handleCopy('ssn', piiData.ssn!)}
                  />
                )}
                {piiData.dob && (
                  <PIIField
                    label="Date of Birth"
                    value={new Date(piiData.dob).toLocaleDateString()}
                    allowCopy={allowCopy}
                    copied={copiedField === 'dob'}
                    onCopy={() => handleCopy('dob', piiData.dob!)}
                  />
                )}
                {piiData.driversLicense && (
                  <PIIField
                    label="Driver's License"
                    value={`${piiData.driversLicense.number} (${piiData.driversLicense.state})`}
                    allowCopy={allowCopy}
                    copied={copiedField === 'dl'}
                    onCopy={() => handleCopy('dl', piiData.driversLicense!.number)}
                  />
                )}
              </PIISection>

              {/* Contact Information */}
              <PIISection title="Contact Information">
                {piiData.email && (
                  <PIIField
                    label="Email"
                    value={piiData.email}
                    allowCopy={allowCopy}
                    copied={copiedField === 'email'}
                    onCopy={() => handleCopy('email', piiData.email!)}
                  />
                )}
                {piiData.phone && (
                  <PIIField
                    label="Phone"
                    value={piiData.phone}
                    allowCopy={allowCopy}
                    copied={copiedField === 'phone'}
                    onCopy={() => handleCopy('phone', piiData.phone!)}
                  />
                )}
                {piiData.address && (
                  <PIIField
                    label="Address"
                    value={`${piiData.address.line1}, ${piiData.address.city}, ${piiData.address.state} ${piiData.address.postal}`}
                    allowCopy={allowCopy}
                    copied={copiedField === 'address'}
                    onCopy={() =>
                      handleCopy(
                        'address',
                        `${piiData.address!.line1}, ${piiData.address!.city}, ${piiData.address!.state} ${piiData.address!.postal}`
                      )
                    }
                  />
                )}
              </PIISection>

              {/* Financial Information */}
              {(piiData.creditScore || piiData.bankAccount) && (
                <PIISection title="Financial Information">
                  {piiData.creditScore && (
                    <PIIField
                      label="Credit Score"
                      value={piiData.creditScore.toString()}
                      allowCopy={allowCopy}
                      copied={copiedField === 'credit'}
                      onCopy={() => handleCopy('credit', piiData.creditScore!.toString())}
                    />
                  )}
                  {piiData.bankAccount && (
                    <>
                      <PIIField
                        label="Bank Name"
                        value={piiData.bankAccount.bankName}
                        allowCopy={allowCopy}
                        copied={copiedField === 'bank'}
                        onCopy={() => handleCopy('bank', piiData.bankAccount!.bankName)}
                      />
                      <PIIField
                        label="Account Number"
                        value={`****${piiData.bankAccount.accountNumber.slice(-4)}`}
                        sensitive
                        allowCopy={false}
                      />
                    </>
                  )}
                </PIISection>
              )}

              {/* Employment */}
              {piiData.employmentInfo && (
                <PIISection title="Employment">
                  <PIIField
                    label="Employer"
                    value={piiData.employmentInfo.employer}
                    allowCopy={allowCopy}
                    copied={copiedField === 'employer'}
                    onCopy={() => handleCopy('employer', piiData.employmentInfo!.employer)}
                  />
                  <PIIField
                    label="Position"
                    value={piiData.employmentInfo.position}
                  />
                  <PIIField
                    label="Monthly Income"
                    value={`$${piiData.employmentInfo.monthlyIncome.toLocaleString()}`}
                  />
                </PIISection>
              )}

              {/* Audit Info */}
              <div className="bg-surface-subtle rounded-lg p-4 text-xs text-text-tertiary">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-semibold">Audit Trail</span>
                </div>
                <p>Access reason: {reason}</p>
                <p>Accessed: {new Date().toLocaleString()}</p>
                <p>All access is logged and monitored</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </RoleGuard>
  );
}

/**
 * PII Section Component
 */
function PIISection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-text-primary mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * PII Field Component
 */
interface PIIFieldProps {
  label: string;
  value: string;
  sensitive?: boolean;
  allowCopy?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}

function PIIField({
  label,
  value,
  sensitive = false,
  allowCopy = false,
  copied = false,
  onCopy,
}: PIIFieldProps) {
  return (
    <div className="bg-surface-base border border-border-base rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-text-tertiary">{label}</span>
        {allowCopy && onCopy && (
          <button
            onClick={onCopy}
            className="p-1 hover:bg-surface-subtle rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-text-tertiary" />
            )}
          </button>
        )}
      </div>
      <div
        className={cn(
          'text-sm font-mono',
          sensitive ? 'font-bold text-red-600' : 'text-text-primary'
        )}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Access Denied Fallback
 */
function PIIAccessDenied() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-base border border-border-base rounded-xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-bold text-text-primary">Access Denied</h2>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          You do not have permission to view protected customer information.
          Contact your administrator if you need access.
        </p>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-xs text-red-900 dark:text-red-200">
            Required permission: <strong>PII_VIEW</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Format SSN with dashes
 */
function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return ssn;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
}
