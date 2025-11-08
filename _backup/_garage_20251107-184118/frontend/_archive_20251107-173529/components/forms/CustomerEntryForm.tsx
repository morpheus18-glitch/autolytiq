/**
 * Customer Entry Form
 *
 * Comprehensive form for creating/editing customers
 * Features:
 * - Manual data entry for all customer fields
 * - License scanning with OCR (auto-populate)
 * - Validation with react-hook-form + zod
 * - Persistent storage to database
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@repo/ui';
import { X, Camera, Loader2, User, Mail, Phone, MapPin, Briefcase, DollarSign, FileText } from 'lucide-react';

/**
 * Customer form validation schema
 */
const customerFormSchema = z.object({
  // Required fields
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),

  // Personal info
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  phoneSecondary: z.string().optional(),
  mobile: z.string().optional(),
  dateOfBirth: z.string().optional(),

  // License
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  licenseExpiry: z.string().optional(),
  ssn: z.string().optional(),

  // Address
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  addressCountry: z.string().default('USA'),
  county: z.string().optional(),

  // Contact preferences
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'MAIL']).default('EMAIL'),

  // Lead info
  leadSource: z.enum(['WEBSITE', 'PHONE', 'WALKIN', 'REFERRAL', 'SOCIAL', 'EMAIL', 'PAID_AD', 'ORGANIC_SEARCH', 'EVENT', 'OTHER']).default('WEBSITE'),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'ARCHIVED']).default('NEW'),
  creditScore: z.number().int().min(300).max(850).optional().or(z.nan()),

  // Employment
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  monthlyIncome: z.number().int().optional().or(z.nan()),

  // Housing
  housingStatus: z.string().optional(),
  monthlyPayment: z.number().int().optional().or(z.nan()),
  yearsAtAddress: z.number().int().optional().or(z.nan()),

  // Consent
  consentTcpa: z.boolean().default(false),
  consentCredit: z.boolean().default(false),

  // Co-buyer
  coBuyerFirstName: z.string().optional(),
  coBuyerLastName: z.string().optional(),
  coBuyerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  coBuyerPhone: z.string().optional(),
  coBuyerDateOfBirth: z.string().optional(),
  coBuyerSsn: z.string().optional(),
  coBuyerEmployer: z.string().optional(),
  coBuyerIncome: z.number().int().optional().or(z.nan()),

  // Additional
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  onSuccess?: (customer: any) => void;
}

export function CustomerEntryForm({ isOpen, onClose, customerId, onSuccess }: CustomerEntryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      preferredContactMethod: 'EMAIL',
      leadSource: 'WEBSITE',
      leadStatus: 'NEW',
      addressCountry: 'USA',
      consentTcpa: false,
      consentCredit: false,
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return apiRequest('POST', '/api/customers', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ title: 'Customer created successfully!' });
      if (onSuccess) onSuccess(response.data);
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create customer',
        description: error?.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Scan license mutation
  const scanLicenseMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/customers/scan-license', {});
    },
    onSuccess: (response) => {
      const data = response.data;
      // Auto-populate form fields from scanned data
      setValue('firstName', data.firstName);
      setValue('lastName', data.lastName);
      setValue('middleName', data.middleName);
      setValue('dateOfBirth', data.dateOfBirth?.split('T')[0]);
      setValue('licenseNumber', data.licenseNumber);
      setValue('licenseState', data.licenseState);
      setValue('licenseExpiry', data.licenseExpiry?.split('T')[0]);
      setValue('addressStreet', data.addressStreet);
      setValue('addressCity', data.addressCity);
      setValue('addressState', data.addressState);
      setValue('addressZip', data.addressZip);
      setValue('addressCountry', data.addressCountry);
      toast({ title: 'License scanned successfully! (Mock data)' });
    },
    onError: () => {
      toast({ title: 'Failed to scan license', variant: 'destructive' });
    },
  });

  const handleScanLicense = async () => {
    setIsScanning(true);
    await scanLicenseMutation.mutateAsync();
    setIsScanning(false);
  };

  const onSubmit = async (data: CustomerFormData) => {
    await createCustomerMutation.mutateAsync(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Add New Customer</h2>
              <p className="text-blue-100 text-sm">Enter customer information or scan license</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Scan License Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleScanLicense}
              disabled={isScanning}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Scan Driver's License
                </>
              )}
            </button>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('firstName')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lastName')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  {...register('middleName')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">SSN</label>
                <input
                  {...register('ssn')}
                  type="password"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="***-**-****"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Credit Score</label>
                <input
                  {...register('creditScore', { valueAsNumber: true })}
                  type="number"
                  min="300"
                  max="850"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="700"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile</label>
                <input
                  {...register('mobile')}
                  type="tel"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="(555) 987-6543"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Contact</label>
                <select
                  {...register('preferredContactMethod')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="SMS">SMS</option>
                  <option value="MAIL">Mail</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  {...register('addressStreet')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                <input
                  {...register('addressCity')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Los Angeles"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                <input
                  {...register('addressState')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ZIP Code</label>
                <input
                  {...register('addressZip')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="90001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
                <input
                  {...register('addressCountry')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="USA"
                />
              </div>
            </div>
          </div>

          {/* Driver's License */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Driver's License
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">License Number</label>
                <input
                  {...register('licenseNumber')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="D1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">License State</label>
                <input
                  {...register('licenseState')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  {...register('licenseExpiry')}
                  type="date"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Employment */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Employment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Employer Name</label>
                <input
                  {...register('employerName')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Employer Phone</label>
                <input
                  {...register('employerPhone')}
                  type="tel"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="(555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Income ($)</label>
                <input
                  {...register('monthlyIncome', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Housing */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Housing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Housing Status</label>
                <select
                  {...register('housingStatus')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="OWN">Own</option>
                  <option value="RENT">Rent</option>
                  <option value="FAMILY">Living with Family</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Payment ($)</label>
                <input
                  {...register('monthlyPayment', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Years at Address</label>
                <input
                  {...register('yearsAtAddress', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="3"
                />
              </div>
            </div>
          </div>

          {/* Lead Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Lead Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Source</label>
                <select
                  {...register('leadSource')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="WEBSITE">Website</option>
                  <option value="PHONE">Phone</option>
                  <option value="WALKIN">Walk-in</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="SOCIAL">Social Media</option>
                  <option value="EMAIL">Email</option>
                  <option value="PAID_AD">Paid Ad</option>
                  <option value="ORGANIC_SEARCH">Organic Search</option>
                  <option value="EVENT">Event</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Status</label>
                <select
                  {...register('leadStatus')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Consent</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  {...register('consentTcpa')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">TCPA Consent (for text messages)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  {...register('consentCredit')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Credit Check Consent</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
