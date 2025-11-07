/**
 * Intelligent Search API
 *
 * Universal search across all entities with NLP support
 * - Entity search (customers, vehicles, deals, leads)
 * - Natural language queries
 * - Autocomplete suggestions
 * - Recent and popular searches
 */

import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '@repo/db';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();
router.use(authMiddleware);
router.use(tenantMiddleware);

// Validation schemas
const searchSchema = z.object({
  query: z.string().min(1),
  filters: z.object({
    dateRange: z.string().optional(),
    status: z.array(z.string()).optional(),
    entityTypes: z.array(z.string()).optional(),
  }).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const suggestionsSchema = z.object({
  q: z.string().min(1),
  limit: z.number().min(1).max(20).default(10),
});

// =============================================================================
// POST /api/search - Universal Search
// =============================================================================

router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const { query, filters, limit, offset } = searchSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    // Parse query intent (TODO: integrate with Python NLP service)
    const parsedQuery = parseSearchQuery(query);

    // Execute search based on intent
    let results: any[] = [];
    let total = 0;

    if (parsedQuery.intent === 'entity_search') {
      // Search across multiple entity types
      const searchResults = await searchEntities(tenantId, parsedQuery.searchTerm, filters, parsedQuery);
      results = searchResults.results;
      total = searchResults.total;
    } else if (parsedQuery.intent === 'list_filter') {
      // Filter specific entity type
      const filterResults = await filterEntities(tenantId, parsedQuery, filters, limit, offset);
      results = filterResults.results;
      total = filterResults.total;
    } else {
      // Fallback: full-text search
      const fallbackResults = await fullTextSearch(tenantId, query, limit, offset);
      results = fallbackResults.results;
      total = fallbackResults.total;
    }

    const executionTime = Date.now() - startTime;

    // Save search query for analytics
    await prisma.searchQuery.create({
      data: {
        tenantId,
        userId,
        query,
        parsedQuery: parsedQuery as any,
        resultType: parsedQuery.entity || 'multi',
        resultCount: total,
        executionTime,
      },
    }).catch(err => console.error('Failed to save search query:', err));

    const response: any = {
      results,
      total,
      executionTime,
      parsedQuery,
      suggestions: generateSuggestions(query, parsedQuery),
    };

    // Add VIN decode info if it was a VIN search
    if (parsedQuery.isVIN && results.length > 0) {
      // Find the VIN decode result in results (added by searchEntities)
      const vinResult = results.find((r: any) => r.type === 'vin_decode');
      if (vinResult) {
        response.vinDecode = vinResult.data;
      }
    }

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// =============================================================================
// GET /api/search/suggestions - Autocomplete
// =============================================================================

router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit } = suggestionsSchema.parse({
      q: req.query.q,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    const tenantId = req.tenantId!;

    const suggestions = await generateAutocompleteSuggestions(tenantId, q, limit);

    res.json({ suggestions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Suggestions failed:', error);
    res.status(500).json({ error: 'Suggestions failed' });
  }
});

// =============================================================================
// GET /api/search/recent - Recent Searches
// =============================================================================

router.get('/recent', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const recent = await prisma.searchQuery.findMany({
      where: { tenantId, userId },
      select: {
        query: true,
        resultType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      distinct: ['query'],
    });

    res.json({
      recent: recent.map(r => ({
        query: r.query,
        type: r.resultType,
        timestamp: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Recent searches failed:', error);
    res.status(500).json({ error: 'Failed to fetch recent searches' });
  }
});

// =============================================================================
// GET /api/search/popular - Popular Searches
// =============================================================================

router.get('/popular', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const category = req.query.category as string | undefined;

    const popular = await prisma.popularSearch.findMany({
      where: {
        tenantId,
        ...(category ? { category } : {}),
      },
      orderBy: { count: 'desc' },
      take: 10,
    });

    res.json({
      popular: popular.map(p => ({
        query: p.query,
        category: p.category,
        count: p.count,
      })),
    });
  } catch (error) {
    console.error('Popular searches failed:', error);
    res.status(500).json({ error: 'Failed to fetch popular searches' });
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

function parseSearchQuery(query: string): any {
  const lowerQuery = query.toLowerCase();

  // Check for deal number pattern
  if (/deal\s*#?\d+/.test(lowerQuery)) {
    const dealNumber = query.match(/\d+/)?.[0];
    return {
      intent: 'entity_search',
      entity: 'deal',
      searchTerm: dealNumber,
    };
  }

  // Check for VIN pattern
  const vinMatch = query.toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  if (vinMatch) {
    return {
      intent: 'entity_search',
      entity: 'vehicle',
      searchTerm: vinMatch[0],
      isVIN: true, // Flag that this is a VIN search
    };
  }

  // Check for filter patterns
  if (lowerQuery.includes('over') || lowerQuery.includes('more than') || lowerQuery.includes('less than')) {
    return {
      intent: 'list_filter',
      entity: extractEntityType(lowerQuery),
      filters: extractFilters(query),
    };
  }

  // Default: entity search
  return {
    intent: 'entity_search',
    entity: 'multi',
    searchTerm: query,
  };
}

function extractEntityType(query: string): string {
  if (query.includes('customer')) return 'customers';
  if (query.includes('vehicle') || query.includes('car') || query.includes('truck')) return 'vehicles';
  if (query.includes('deal')) return 'deals';
  if (query.includes('lead')) return 'leads';
  if (query.includes('appraisal')) return 'appraisals';
  return 'multi';
}

function extractFilters(query: string): any[] {
  // TODO: Implement proper NLP filter extraction
  return [];
}

/**
 * Decode VIN using NHTSA API
 */
async function decodeVIN(vin: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      { timeout: 5000 }
    );

    if (!response.data.Results || response.data.Results.length === 0) {
      return null;
    }

    const result = response.data.Results[0];

    // Check for errors
    if (result.ErrorCode && result.ErrorCode !== '0') {
      return null;
    }

    return {
      year: result.ModelYear ? parseInt(result.ModelYear) : null,
      make: result.Make || null,
      model: result.Model || null,
      trim: result.Trim || null,
      bodyStyle: result.BodyClass || null,
      engineType: result.EngineModel || null,
      transmission: result.TransmissionStyle || null,
      driveType: result.DriveType || null,
      fuelType: result.FuelTypePrimary || null,
    };
  } catch (error) {
    console.error('VIN decode error:', error);
    return null;
  }
}

async function searchEntities(tenantId: string, searchTerm: string, filters: any, parsedQuery?: any): Promise<any> {
  const results: any[] = [];

  // If this is a VIN search, decode it first and add decoded info to results
  let vinDecodeResult: any = null;
  if (parsedQuery?.isVIN) {
    vinDecodeResult = await decodeVIN(searchTerm);
  }

  // Search customers
  const customers = await prisma.customer.findMany({
    where: {
      tenantId,
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      creditScore: true,
    },
  });

  customers.forEach(c => {
    results.push({
      type: 'customer',
      id: c.id,
      data: c,
      score: 0.9,
    });
  });

  // Search vehicles
  const vehicles = await prisma.vehicle.findMany({
    where: {
      tenantId,
      OR: [
        { vin: { contains: searchTerm, mode: 'insensitive' } },
        { stockNumber: { contains: searchTerm, mode: 'insensitive' } },
        { make: { contains: searchTerm, mode: 'insensitive' } },
        { model: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      vin: true,
      stockNumber: true,
      year: true,
      make: true,
      model: true,
      trim: true,
      price: true,
      status: true,
    },
  });

  vehicles.forEach(v => {
    results.push({
      type: 'vehicle',
      id: v.id,
      data: v,
      score: 0.85,
    });
  });

  // If VIN was decoded, add it as a special result type
  if (vinDecodeResult) {
    results.unshift({
      type: 'vin_decode',
      id: `vin-${searchTerm}`,
      data: {
        vin: searchTerm,
        decoded: vinDecodeResult,
        message: vehicles.length > 0
          ? `Found ${vehicles.length} vehicle(s) matching this VIN in inventory`
          : 'VIN decoded successfully. This vehicle is not in your inventory yet.',
      },
      score: 1.0, // Highest score for exact VIN match
    });
  }

  // Search deals
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      OR: [
        { dealNumber: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      dealNumber: true,
      status: true,
      totalAmount: true,
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      vehicle: {
        select: {
          year: true,
          make: true,
          model: true,
        },
      },
    },
  });

  deals.forEach(d => {
    results.push({
      type: 'deal',
      id: d.id,
      data: d,
      score: 0.88,
    });
  });

  return {
    results: results.sort((a, b) => b.score - a.score),
    total: results.length,
  };
}

async function filterEntities(tenantId: string, parsedQuery: any, filters: any, limit: number, offset: number): Promise<any> {
  // TODO: Implement dynamic query building based on parsed filters
  return { results: [], total: 0 };
}

async function fullTextSearch(tenantId: string, query: string, limit: number, offset: number): Promise<any> {
  // Fallback: search across all text fields
  const results = await searchEntities(tenantId, query, {});
  return results;
}

function generateSuggestions(query: string, parsedQuery: any): string[] {
  const suggestions: string[] = [];

  if (parsedQuery.entity === 'deals') {
    suggestions.push('deals over $50k', 'pending deals', 'deals this week');
  } else if (parsedQuery.entity === 'customers') {
    suggestions.push('customers with credit score above 700', 'hot leads', 'recent customers');
  } else if (parsedQuery.entity === 'vehicles') {
    suggestions.push('vehicles over 60 days', 'red sedans', 'trucks under $30k');
  }

  return suggestions.slice(0, 3);
}

async function generateAutocompleteSuggestions(tenantId: string, query: string, limit: number): Promise<any[]> {
  const suggestions: any[] = [];

  // Search recent queries
  const recent = await prisma.searchQuery.findMany({
    where: {
      tenantId,
      query: { contains: query, mode: 'insensitive' },
    },
    select: { query: true, resultType: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
    distinct: ['query'],
  });

  recent.forEach(r => {
    suggestions.push({
      text: r.query,
      category: 'recent',
      type: r.resultType,
    });
  });

  // Add popular searches
  const popular = await prisma.popularSearch.findMany({
    where: {
      tenantId,
      query: { contains: query, mode: 'insensitive' },
    },
    orderBy: { count: 'desc' },
    take: 5,
  });

  popular.forEach(p => {
    suggestions.push({
      text: p.query,
      category: 'popular',
      type: p.category,
      count: p.count,
    });
  });

  return suggestions.slice(0, limit);
}

export default router;
