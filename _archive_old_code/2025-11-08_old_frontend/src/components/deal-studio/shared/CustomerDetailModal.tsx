/**
 * Customer Detail Modal
 *
 * Pops up when clicking customer name in Deal Studio
 * Shows full customer profile, credit info, contact details
 */

import { useQuery } from '@tanstack/react-query';
import { X, User, Phone, Mail, MapPin, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface CustomerDetailModalProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({ customerId, isOpen, onClose }: CustomerDetailModalProps) {
  const { data: customerData, isLoading } = useQuery({
    queryKey: ['/api/customers', customerId],
    queryFn: () => apiRequest('GET', `/api/customers/${customerId}`),
    enabled: isOpen && !!customerId,
  });

  const customer = customerData?.data;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Customer Details</h2>
              {customer && (
                <p className="text-blue-100 text-sm">
                  {customer.firstName} {customer.lastName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : customer ? (
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Mail} label="Email" value={customer.email || 'Not provided'} />
                <InfoCard icon={Phone} label="Phone" value={customer.phone || 'Not provided'} />
                <InfoCard
                  icon={MapPin}
                  label="Address"
                  value={customer.addressZip
                    ? `${customer.addressCity}, ${customer.addressState} ${customer.addressZip}`
                    : 'Not provided'
                  }
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={CreditCard}
                  label="FICO Score"
                  value={customer.creditScore?.toString() || 'Not available'}
                  highlight={customer.creditScore ? customer.creditScore >= 700 : false}
                />
                <InfoCard
                  icon={DollarSign}
                  label="Monthly Income"
                  value={customer.monthlyIncome
                    ? `$${customer.monthlyIncome.toLocaleString()}`
                    : 'Not provided'
                  }
                />
                <InfoCard
                  icon={Calendar}
                  label="Housing Status"
                  value={customer.housingStatus || 'Not provided'}
                />
                <InfoCard
                  icon={DollarSign}
                  label="Monthly Housing Payment"
                  value={customer.monthlyPayment
                    ? `$${customer.monthlyPayment.toLocaleString()}`
                    : 'Not provided'
                  }
                />
              </div>
            </div>

            {/* Lead Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Lead Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  label="Lead Source"
                  value={customer.leadSource || 'Unknown'}
                />
                <InfoCard
                  label="Lead Status"
                  value={customer.leadStatus || 'Unknown'}
                />
                <InfoCard
                  label="Lead Score"
                  value={`${customer.leadScore || 0}/100`}
                  highlight={customer.leadScore && customer.leadScore >= 70}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View Full Profile
              </button>
              <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                Run Credit
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Customer not found
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight = false,
  className,
}: {
  icon?: any;
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('bg-slate-50 rounded-lg p-4', className)}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
          <div className={cn(
            'text-sm font-semibold truncate',
            highlight ? 'text-green-600' : 'text-slate-900'
          )}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
