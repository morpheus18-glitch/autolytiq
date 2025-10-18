import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { DealJacketDto } from '../api';
import {
  CreditApplicationDto,
  CreditApplicationPayload,
  CreditReferenceDto,
  fetchCreditApplication,
  saveCreditApplication,
} from '../api';
import { cn } from '@/lib/utils';

const residenceOptions = ['Own', 'Rent', 'Lease', 'Family', 'Other'];
const defaultReference: CreditReferenceDto = { name: '', relationship: '', phone: '' };

export interface CreditApplicationProps {
  deal: DealJacketDto;
  active?: boolean;
  onApplicationSaved?: (application: CreditApplicationDto) => void;
  onProceedToBureau?: () => void;
}

type CreditApplicationFormValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  currentStreet: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  yearsAtAddress: string;
  monthsAtAddress: string;
  residenceType: string;
  monthlyPayment: string;
  previousStreet: string;
  previousCity: string;
  previousState: string;
  previousZip: string;
  employer: string;
  jobTitle: string;
  yearsEmployed: string;
  monthsEmployed: string;
  monthlyIncome: string;
  employerPhone: string;
  otherIncomeSource: string;
  otherIncomeAmount: string;
  coApplicantFirstName: string;
  coApplicantLastName: string;
  coApplicantPhone: string;
  coApplicantEmail: string;
  coApplicantSsn: string;
  references: CreditReferenceDto[];
  authorizeCredit: boolean;
  certifyAccuracy: boolean;
  privacyConsent: boolean;
  signature: string;
  signedAt: string;
};

function buildDefaultValues(deal: DealJacketDto): CreditApplicationFormValues {
  return {
    firstName: deal.customer?.firstName ?? '',
    middleName: '',
    lastName: deal.customer?.lastName ?? '',
    ssn: '',
    dateOfBirth: '',
    phone: '',
    email: deal.customer?.email ?? '',
    currentStreet: '',
    currentCity: '',
    currentState: '',
    currentZip: '',
    yearsAtAddress: '0',
    monthsAtAddress: '0',
    residenceType: residenceOptions[0]!,
    monthlyPayment: '',
    previousStreet: '',
    previousCity: '',
    previousState: '',
    previousZip: '',
    employer: '',
    jobTitle: '',
    yearsEmployed: '0',
    monthsEmployed: '0',
    monthlyIncome: '',
    employerPhone: '',
    otherIncomeSource: '',
    otherIncomeAmount: '',
    coApplicantFirstName: '',
    coApplicantLastName: '',
    coApplicantPhone: '',
    coApplicantEmail: '',
    coApplicantSsn: '',
    references: [defaultReference, defaultReference].map((ref) => ({ ...ref })),
    authorizeCredit: false,
    certifyAccuracy: false,
    privacyConsent: false,
    signature: '',
    signedAt: '',
  };
}

function toCurrencyString(value?: string | null) {
  if (!value) return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '';
  return numeric.toString();
}

function formatDateInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

export default function CreditApplication({ deal, active, onApplicationSaved, onProceedToBureau }: CreditApplicationProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [includeCoApplicant, setIncludeCoApplicant] = useState(false);
  const [ssnPlaceholder, setSsnPlaceholder] = useState<string | undefined>();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<CreditApplicationFormValues>({
    defaultValues: useMemo(() => buildDefaultValues(deal), [deal]),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'references',
  });

  const { data: existingApplication, isLoading } = useQuery({
    queryKey: ['fi', 'deal', deal.id, 'credit-application'],
    queryFn: () => fetchCreditApplication(deal.id),
  });

  useEffect(() => {
    if (!existingApplication) {
      replace(buildDefaultValues(deal).references);
      setIncludeCoApplicant(false);
      setSsnPlaceholder(undefined);
      return;
    }
    const values = buildDefaultValues(deal);
    values.firstName = existingApplication.firstName;
    values.middleName = existingApplication.middleName ?? '';
    values.lastName = existingApplication.lastName;
    values.dateOfBirth = formatDateInput(existingApplication.dateOfBirth);
    values.phone = existingApplication.phone;
    values.email = existingApplication.email;
    values.currentStreet = existingApplication.currentStreet;
    values.currentCity = existingApplication.currentCity;
    values.currentState = existingApplication.currentState;
    values.currentZip = existingApplication.currentZip;
    values.yearsAtAddress = String(existingApplication.yearsAtAddress ?? 0);
    values.monthsAtAddress = String(existingApplication.monthsAtAddress ?? 0);
    values.residenceType = existingApplication.residenceType ?? residenceOptions[0]!;
    values.monthlyPayment = toCurrencyString(existingApplication.monthlyPayment ?? '');
    values.previousStreet = existingApplication.previousStreet ?? '';
    values.previousCity = existingApplication.previousCity ?? '';
    values.previousState = existingApplication.previousState ?? '';
    values.previousZip = existingApplication.previousZip ?? '';
    values.employer = existingApplication.employer;
    values.jobTitle = existingApplication.jobTitle;
    values.yearsEmployed = String(existingApplication.yearsEmployed ?? 0);
    values.monthsEmployed = String(existingApplication.monthsEmployed ?? 0);
    values.monthlyIncome = toCurrencyString(existingApplication.monthlyIncome);
    values.employerPhone = existingApplication.employerPhone;
    values.otherIncomeSource = existingApplication.otherIncomeSource ?? '';
    values.otherIncomeAmount = toCurrencyString(existingApplication.otherIncomeAmount ?? '');
    values.signature = existingApplication.signature ?? '';
    values.signedAt = formatDateInput(existingApplication.signedAt);
    values.references = existingApplication.references.length
      ? existingApplication.references.map((reference) => ({ ...reference }))
      : [defaultReference].map((ref) => ({ ...ref }));
    setIncludeCoApplicant(Boolean(existingApplication.coApplicant));
    if (existingApplication.coApplicant) {
      values.coApplicantFirstName = existingApplication.coApplicant.firstName ?? '';
      values.coApplicantLastName = existingApplication.coApplicant.lastName ?? '';
      values.coApplicantPhone = existingApplication.coApplicant.phone ?? '';
      values.coApplicantEmail = existingApplication.coApplicant.email ?? '';
      values.coApplicantSsn = existingApplication.coApplicant.ssn ?? '';
    }
    values.authorizeCredit = existingApplication.authorizeCredit;
    values.certifyAccuracy = existingApplication.certifyAccuracy;
    values.privacyConsent = existingApplication.privacyConsent;
    reset(values);
    replace(values.references);
    setSsnPlaceholder(existingApplication.ssnMasked ?? undefined);
  }, [existingApplication, deal, reset, replace]);

  const saveMutation = useMutation({
    mutationFn: (payload: CreditApplicationPayload) => saveCreditApplication(payload),
    onSuccess: (application) => {
      queryClient.setQueryData(['fi', 'deal', deal.id, 'credit-application'], application);
      toast({ title: 'Credit application saved' });
      onApplicationSaved?.(application);
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to save credit application',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const pullIntentMutation = useMutation({
    mutationFn: async (payload: CreditApplicationPayload) => saveCreditApplication(payload),
    onSuccess: (application) => {
      queryClient.setQueryData(['fi', 'deal', deal.id, 'credit-application'], application);
      toast({ title: 'Application saved. Continue to select bureau.' });
      onApplicationSaved?.(application);
      onProceedToBureau?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to save and continue',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const isProcessing = isSubmitting || saveMutation.isPending || pullIntentMutation.isPending;

  const onSubmit = async (values: CreditApplicationFormValues, shouldProceed: boolean) => {
    const parseNumber = (value: string, fallback?: number) => {
      if (!value) return fallback ?? 0;
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        throw new Error('Invalid numeric value provided');
      }
      return numeric;
    };

    const references = values.references
      .map((reference) => ({
        name: reference.name.trim(),
        relationship: reference.relationship.trim(),
        phone: reference.phone.trim(),
      }))
      .filter((reference) => reference.name || reference.phone || reference.relationship);

    if (references.length === 0) {
      toast({
        title: 'Please provide at least one reference',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload: CreditApplicationPayload = {
        dealId: deal.id,
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim() || null,
        lastName: values.lastName.trim(),
        ssn: values.ssn.trim() ? values.ssn.replace(/[^0-9]/g, '') : undefined,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone.trim(),
        email: values.email.trim(),
        currentStreet: values.currentStreet.trim(),
        currentCity: values.currentCity.trim(),
        currentState: values.currentState.trim(),
        currentZip: values.currentZip.trim(),
        yearsAtAddress: parseNumber(values.yearsAtAddress),
        monthsAtAddress: parseNumber(values.monthsAtAddress),
        residenceType: values.residenceType.trim(),
        monthlyPayment: values.monthlyPayment ? parseNumber(values.monthlyPayment) : null,
        previousStreet: values.previousStreet.trim() || null,
        previousCity: values.previousCity.trim() || null,
        previousState: values.previousState.trim() || null,
        previousZip: values.previousZip.trim() || null,
        employer: values.employer.trim(),
        jobTitle: values.jobTitle.trim(),
        yearsEmployed: parseNumber(values.yearsEmployed),
        monthsEmployed: parseNumber(values.monthsEmployed),
        monthlyIncome: parseNumber(values.monthlyIncome),
        employerPhone: values.employerPhone.trim(),
        otherIncomeSource: values.otherIncomeSource.trim() || null,
        otherIncomeAmount: values.otherIncomeAmount ? parseNumber(values.otherIncomeAmount) : null,
        coApplicant: includeCoApplicant
          ? {
              firstName: values.coApplicantFirstName.trim() || undefined,
              lastName: values.coApplicantLastName.trim() || undefined,
              phone: values.coApplicantPhone.trim() || undefined,
              email: values.coApplicantEmail.trim() || undefined,
              ssn: values.coApplicantSsn.trim() ? values.coApplicantSsn.replace(/[^0-9]/g, '') : undefined,
            }
          : null,
        references,
        authorizeCredit: values.authorizeCredit,
        certifyAccuracy: values.certifyAccuracy,
        privacyConsent: values.privacyConsent,
        signature: values.signature.trim() || undefined,
        signedAt: values.signedAt || undefined,
      };

      if (shouldProceed) {
        await pullIntentMutation.mutateAsync(payload);
      } else {
        await saveMutation.mutateAsync(payload);
      }
    } catch (error: any) {
      toast({
        title: 'Unable to save credit application',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleImportFromCrm = () => {
    const customer = deal.customer;
    if (!customer) {
      toast({ title: 'No customer data available to import', variant: 'destructive' });
      return;
    }
    const values = buildDefaultValues(deal);
    const currentValues = {
      ...values,
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
      email: customer.email ?? '',
    };
    reset({ ...watch(), ...currentValues });
    toast({ title: 'CRM data imported' });
  };

  const handleAddReference = () => {
    append({ ...defaultReference });
  };

  useEffect(() => {
    if (!includeCoApplicant) {
      setValue('coApplicantFirstName', '', { shouldDirty: false });
      setValue('coApplicantLastName', '', { shouldDirty: false });
      setValue('coApplicantPhone', '', { shouldDirty: false });
      setValue('coApplicantEmail', '', { shouldDirty: false });
      setValue('coApplicantSsn', '', { shouldDirty: false });
    }
  }, [includeCoApplicant, setValue]);

  return (
    <Card className={cn('shadow-sm', active && 'border-primary')}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Step 1 · Credit Application</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleImportFromCrm}>
            Import from CRM
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSubmit((values) => onSubmit(values, false))}
            disabled={isProcessing}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit((values) => onSubmit(values, true))}
            disabled={isProcessing}
          >
            {pullIntentMutation.isPending ? 'Saving…' : 'Save &amp; Continue'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading credit application…</p>
        ) : (
          <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Jane" {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" placeholder="Marie" {...register('middleName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...register('lastName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssn">SSN</Label>
                <Input
                  id="ssn"
                  placeholder={ssnPlaceholder ?? '123-45-6789'}
                  {...register('ssn')}
                  autoComplete="off"
                />
                {ssnPlaceholder && (
                  <p className="text-xs text-muted-foreground">Stored securely. Enter a new value to update.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 123-4567" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Residence</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentStreet">Street</Label>
                  <Input id="currentStreet" {...register('currentStreet')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCity">City</Label>
                  <Input id="currentCity" {...register('currentCity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentState">State</Label>
                  <Input id="currentState" {...register('currentState')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentZip">ZIP</Label>
                  <Input id="currentZip" {...register('currentZip')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsAtAddress">Years at address</Label>
                  <Input id="yearsAtAddress" type="number" min={0} {...register('yearsAtAddress')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthsAtAddress">Months at address</Label>
                  <Input id="monthsAtAddress" type="number" min={0} max={11} {...register('monthsAtAddress')} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="residenceType">Residence Type</Label>
                <Select
                  value={watch('residenceType')}
                  onValueChange={(value) => setValue('residenceType', value, { shouldDirty: true })}
                >
                    <SelectTrigger id="residenceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {residenceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">Monthly Housing Payment</Label>
                  <Input id="monthlyPayment" type="number" step="0.01" {...register('monthlyPayment')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="previousStreet">Previous Street</Label>
                  <Input id="previousStreet" {...register('previousStreet')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousCity">Previous City</Label>
                  <Input id="previousCity" {...register('previousCity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousState">Previous State</Label>
                  <Input id="previousState" {...register('previousState')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousZip">Previous ZIP</Label>
                  <Input id="previousZip" {...register('previousZip')} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Employment &amp; Income</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input id="employer" {...register('employer')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" {...register('jobTitle')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsEmployed">Years Employed</Label>
                  <Input id="yearsEmployed" type="number" min={0} {...register('yearsEmployed')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthsEmployed">Months Employed</Label>
                  <Input id="monthsEmployed" type="number" min={0} max={11} {...register('monthsEmployed')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input id="monthlyIncome" type="number" step="0.01" {...register('monthlyIncome')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerPhone">Employer Phone</Label>
                  <Input id="employerPhone" {...register('employerPhone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherIncomeSource">Other Income Source</Label>
                  <Input id="otherIncomeSource" {...register('otherIncomeSource')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherIncomeAmount">Other Monthly Income</Label>
                  <Input id="otherIncomeAmount" type="number" step="0.01" {...register('otherIncomeAmount')} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox id="includeCoApplicant" checked={includeCoApplicant} onCheckedChange={(checked) => setIncludeCoApplicant(Boolean(checked))} />
                <Label htmlFor="includeCoApplicant" className="text-sm font-medium">
                  Add Co-Applicant
                </Label>
              </div>
              {includeCoApplicant && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="coApplicantFirstName">First Name</Label>
                    <Input id="coApplicantFirstName" {...register('coApplicantFirstName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coApplicantLastName">Last Name</Label>
                    <Input id="coApplicantLastName" {...register('coApplicantLastName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coApplicantPhone">Phone</Label>
                    <Input id="coApplicantPhone" {...register('coApplicantPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coApplicantEmail">Email</Label>
                    <Input id="coApplicantEmail" type="email" {...register('coApplicantEmail')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coApplicantSsn">SSN</Label>
                    <Input id="coApplicantSsn" {...register('coApplicantSsn')} />
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">References</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddReference}>
                  Add Reference
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`references.${index}.name`}>Name</Label>
                      <Input id={`references.${index}.name`} {...register(`references.${index}.name` as const)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`references.${index}.relationship`}>Relationship</Label>
                      <Input id={`references.${index}.relationship`} {...register(`references.${index}.relationship` as const)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`references.${index}.phone`}>Phone</Label>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-8 px-2 text-xs"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <Input id={`references.${index}.phone`} {...register(`references.${index}.phone` as const)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Authorizations</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    id="authorizeCredit"
                    checked={watch('authorizeCredit')}
                    onCheckedChange={(checked) => setValue('authorizeCredit', Boolean(checked), { shouldDirty: true })}
                  />
                  <span>
                    I authorize the dealership to obtain my consumer credit report to evaluate and process my credit application.
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    id="certifyAccuracy"
                    checked={watch('certifyAccuracy')}
                    onCheckedChange={(checked) => setValue('certifyAccuracy', Boolean(checked), { shouldDirty: true })}
                  />
                  <span>I certify that all information provided is true and correct to the best of my knowledge.</span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    id="privacyConsent"
                    checked={watch('privacyConsent')}
                    onCheckedChange={(checked) => setValue('privacyConsent', Boolean(checked), { shouldDirty: true })}
                  />
                  <span>I acknowledge receipt of the privacy disclosure and consent to electronic communications.</span>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="signature">Signature</Label>
                  <Input id="signature" placeholder="Type full legal name" {...register('signature')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signedAt">Signed Date</Label>
                  <Input id="signedAt" type="date" {...register('signedAt')} />
                </div>
              </div>
            </section>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
