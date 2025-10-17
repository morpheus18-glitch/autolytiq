import { z } from 'zod';

export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeSchema = z
  .string({ required_error: 'Time is required' })
  .regex(timeRegex, 'Use 24-hour time in HH:MM format');

const businessHourSchema = z.object({
  day: z.enum(WEEK_DAYS),
  openTime: timeSchema,
  closeTime: timeSchema,
  closed: z.boolean(),
});

export const businessHoursSchema = z
  .array(businessHourSchema)
  .length(WEEK_DAYS.length, 'Provide business hours for each day of the week')
  .superRefine((hours, ctx) => {
    const seen = new Set<WeekDay>();
    hours.forEach((hour, index) => {
      if (seen.has(hour.day)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate day entries are not allowed',
          path: [index, 'day'],
        });
      }
      seen.add(hour.day);

      if (!hour.closed) {
        if (!timeRegex.test(hour.openTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Opening time is required when the dealership is open',
            path: [index, 'openTime'],
          });
        }
        if (!timeRegex.test(hour.closeTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Closing time is required when the dealership is open',
            path: [index, 'closeTime'],
          });
        }
        if (hour.closeTime <= hour.openTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Closing time must be later than opening time',
            path: [index, 'closeTime'],
          });
        }
      }
    });
  });

const optionalUrlSchema = z
  .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) {
      return '';
    }
    return value;
  });

const currencySchema = z
  .coerce
  .number({ invalid_type_error: 'Enter a valid amount' })
  .min(0, 'Amount cannot be negative')
  .max(1_000_000, 'Amount is unreasonably large');

const phoneRegex = /^(?:\(\d{3}\) \d{3}-\d{4})$/;
const taxIdRegex = /^\d{2}-\d{7}$/;
const zipRegex = /^\d{5}(?:-\d{4})?$/;
const stateRegex = /^(?:A[EKLRZ]|C[AOT]|D[EC]|F[LM]|G[AU]|H[HI]|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HK]|P[AE]|R[IL]|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/;

export const dealershipSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z
      .string()
      .toUpperCase()
      .regex(stateRegex, 'Use a valid two-letter state abbreviation'),
    zip: z.string().regex(zipRegex, 'Use a valid ZIP code (12345 or 12345-6789)'),
  }),
  phone: z.string().regex(phoneRegex, 'Use the format (555) 123-4567'),
  email: z.string().email('Enter a valid email address'),
  websiteUrl: optionalUrlSchema,
  taxId: z.string().regex(taxIdRegex, 'Use the format 12-3456789'),
  dealerLicenseNumber: z.string().min(1, 'Dealer license number is required'),
  businessHours: businessHoursSchema,
  docFee: currencySchema,
  registrationFee: currencySchema,
  stateSalesTaxRate: z
    .coerce
    .number({ invalid_type_error: 'Enter a valid percentage' })
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  logoUrl: optionalUrlSchema,
});

export type DealershipSettings = z.infer<typeof dealershipSettingsSchema>;
export type BusinessHour = DealershipSettings['businessHours'][number];

const colorHexSchema = z
  .string({ required_error: 'Color is required' })
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Provide a valid hex color');

const htmlContentSchema = z
  .string()
  .max(20000, 'Content is too long');

export const brandAssetTypes = [
  'logo',
  'darkLogo',
  'favicon',
  'invoiceHeader',
  'purchaseAgreementHeader',
] as const;

export type BrandAssetType = (typeof brandAssetTypes)[number];

export const brandingSettingsSchema = z.object({
  colors: z.object({
    primary: colorHexSchema,
    secondary: colorHexSchema,
    accent: colorHexSchema,
    success: colorHexSchema,
    warning: colorHexSchema,
    error: colorHexSchema,
  }),
  logos: z.object({
    logo: optionalUrlSchema,
    darkLogo: optionalUrlSchema,
    favicon: optionalUrlSchema,
  }),
  emailBranding: z.object({
    headerHtml: htmlContentSchema,
    footerHtml: htmlContentSchema,
  }),
  documentBranding: z.object({
    invoiceHeaderHtml: htmlContentSchema,
    invoiceHeaderImageUrl: optionalUrlSchema,
    invoiceFooterHtml: htmlContentSchema,
    purchaseAgreementHeaderHtml: htmlContentSchema,
    purchaseAgreementHeaderImageUrl: optionalUrlSchema,
  }),
  portalTheme: z.object({
    enabled: z.boolean(),
    fontFamily: z.enum(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat']),
    borderRadius: z.number().min(0, 'Border radius cannot be negative').max(20, 'Border radius must be 20px or less'),
  }),
});

export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

export const defaultBusinessHours: DealershipSettings['businessHours'] = WEEK_DAYS.map((day) => ({
  day,
  openTime: '09:00',
  closeTime: '18:00',
  closed: day === 'sunday',
}));

export const defaultDealershipSettings: DealershipSettings = {
  businessName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
  },
  phone: '',
  email: '',
  websiteUrl: '',
  taxId: '',
  dealerLicenseNumber: '',
  businessHours: defaultBusinessHours,
  docFee: 0,
  registrationFee: 0,
  stateSalesTaxRate: 0,
  logoUrl: '',
};

export const defaultBrandingSettings: BrandingSettings = {
  colors: {
    primary: '#2563EB',
    secondary: '#7C3AED',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  logos: {
    logo: '',
    darkLogo: '',
    favicon: '',
  },
  emailBranding: {
    headerHtml: '',
    footerHtml: '',
  },
  documentBranding: {
    invoiceHeaderHtml: '',
    invoiceHeaderImageUrl: '',
    invoiceFooterHtml: '',
    purchaseAgreementHeaderHtml: '',
    purchaseAgreementHeaderImageUrl: '',
  },
  portalTheme: {
    enabled: false,
    fontFamily: 'Inter',
    borderRadius: 8,
  },
};

export const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};
