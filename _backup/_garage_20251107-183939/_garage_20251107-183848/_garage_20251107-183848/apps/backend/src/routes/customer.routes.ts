import { Router, type RequestHandler } from 'express';
import { db } from '@repo/db';
import { z } from 'zod';

export const customerRouter = Router();

/**
 * Validation schema for customer creation/update
 */
const customerSchema = z.object({
  // Required fields
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),

  // Optional personal info
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  phoneSecondary: z.string().optional(),
  mobile: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),

  // License info
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  licenseExpiry: z.string().datetime().optional(),
  ssn: z.string().optional(),

  // Address
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  addressCountry: z.string().optional(),
  county: z.string().optional(),

  // Contact preferences
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'MAIL']).default('EMAIL'),

  // Lead info
  leadSource: z.enum(['WEBSITE', 'PHONE', 'WALKIN', 'REFERRAL', 'SOCIAL', 'EMAIL', 'PAID_AD', 'ORGANIC_SEARCH', 'EVENT', 'OTHER']).default('WEBSITE'),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'ARCHIVED']).default('NEW'),
  leadScore: z.number().int().min(0).max(100).default(0),
  creditScore: z.number().int().min(300).max(850).optional(),
  assignedToUserId: z.string().optional(),

  // Employment
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  monthlyIncome: z.number().int().optional(),

  // Housing
  housingStatus: z.string().optional(),
  monthlyPayment: z.number().int().optional(),
  yearsAtAddress: z.number().int().optional(),

  // Consent
  consentTcpa: z.boolean().default(false),
  consentCredit: z.boolean().default(false),

  // Co-buyer
  coBuyerFirstName: z.string().optional(),
  coBuyerLastName: z.string().optional(),
  coBuyerEmail: z.string().email('Invalid co-buyer email').optional(),
  coBuyerPhone: z.string().optional(),
  coBuyerDateOfBirth: z.string().datetime().optional(),
  coBuyerSsn: z.string().optional(),
  coBuyerEmployer: z.string().optional(),
  coBuyerIncome: z.number().int().optional(),

  // Additional
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

/**
 * GET /api/customers - List all customers for tenant
 */
customerRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { search, limit = 50 } = req.query;

      const customers = await db.customer.findMany({
        where: {
          tenantId,
          ...(search && {
            OR: [
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
              { email: { contains: search as string, mode: 'insensitive' } },
              { phone: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          addressZip: true,
          creditScore: true,
          leadStatus: true,
        },
        take: parseInt(limit as string, 10),
        orderBy: {
          updatedAt: 'desc',
        },
      });

      res.json({ data: customers });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/customers/:id - Get customer details
 */
customerRouter.get(
  '/:id',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const customer = await db.customer.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          vehicles: {
            where: {
              status: 'OWNED',
            },
            select: {
              id: true,
              vin: true,
              year: true,
              make: true,
              model: true,
              trim: true,
              purchaseDate: true,
              purchasePrice: true,
              currentMileage: true,
              status: true,
            },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ data: customer });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/customers - Create a new customer
 */
customerRouter.post(
  '/',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const userId = req.userId;

      // Validate request body
      const validationResult = customerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors,
        });
      }

      const data = validationResult.data;

      // Convert date strings to Date objects
      const customerData: any = {
        ...data,
        tenantId,
        createdById: userId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
        coBuyerDateOfBirth: data.coBuyerDateOfBirth ? new Date(data.coBuyerDateOfBirth) : undefined,
        consentDate: (data.consentTcpa || data.consentCredit) ? new Date() : undefined,
      };

      // Create customer
      const customer = await db.customer.create({
        data: customerData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          addressZip: true,
          creditScore: true,
          leadStatus: true,
          createdAt: true,
        },
      });

      res.status(201).json({ data: customer });
    } catch (error) {
      console.error('Error creating customer:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * PUT /api/customers/:id - Update an existing customer
 */
customerRouter.put(
  '/:id',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      // Validate request body (all fields optional for update)
      const updateSchema = customerSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors,
        });
      }

      const data = validationResult.data;

      // Check if customer exists and belongs to tenant
      const existingCustomer = await db.customer.findFirst({
        where: { id, tenantId },
      });

      if (!existingCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Convert date strings to Date objects
      const updateData: any = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
        coBuyerDateOfBirth: data.coBuyerDateOfBirth ? new Date(data.coBuyerDateOfBirth) : undefined,
      };

      // Update customer
      const customer = await db.customer.update({
        where: { id },
        data: updateData,
      });

      res.json({ data: customer });
    } catch (error) {
      console.error('Error updating customer:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/customers/scan-license - Extract customer data from driver's license (OCR)
 *
 * TODO: Integrate with actual OCR service (e.g., AWS Textract, Google Vision, MICR)
 * For now, returns mock data based on uploaded image
 */
customerRouter.post(
  '/scan-license',
  (async (req, res, next) => {
    try {
      // TODO: Process uploaded image with OCR service
      // For now, return mock extracted data

      // In production, you would:
      // 1. Receive base64 image or file upload
      // 2. Send to OCR service
      // 3. Parse OCR response
      // 4. Extract: Name, address, DOB, license number, state, expiry

      // Mock extracted data (replace with actual OCR)
      const extractedData = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'A',
        dateOfBirth: '1985-03-15T00:00:00Z',
        licenseNumber: 'D1234567',
        licenseState: 'CA',
        licenseExpiry: '2028-03-15T00:00:00Z',
        addressStreet: '123 Main Street',
        addressCity: 'Los Angeles',
        addressState: 'CA',
        addressZip: '90001',
        addressCountry: 'USA',
      };

      res.json({
        success: true,
        data: extractedData,
        message: 'License scanned successfully (mock data - OCR integration pending)',
      });
    } catch (error) {
      console.error('Error scanning license:', error);
      next(error);
    }
  }) as RequestHandler
);
