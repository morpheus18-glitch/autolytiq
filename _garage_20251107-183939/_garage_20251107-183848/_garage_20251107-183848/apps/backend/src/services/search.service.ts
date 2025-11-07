/**
 * Intelligent Search Service
 * Handles natural language search across all dealership data
 */

import { db } from '@repo/db';
import { Prisma } from '@prisma/client';

export interface SearchOptions {
  tenantId: string;
  userId: string;
  query: string;
  filters?: {
    dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year';
    status?: string[];
    assignedTo?: string;
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  type: 'customer' | 'vehicle' | 'deal' | 'lead' | 'appraisal' | 'user';
  id: string;
  score: number;
  data: any;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  executionTime: number;
  suggestions: string[];
  parsedQuery?: any;
}

/**
 * Universal search across all entities
 */
export async function performSearch(options: SearchOptions): Promise<SearchResponse> {
  const startTime = Date.now();
  const {  tenantId, userId, query, filters = {}, limit = 20, offset = 0 } = options;

  // Sanitize query
  const sanitizedQuery = query.trim().slice(0, 200);

  if (!sanitizedQuery) {
    return {
      results: [],
      total: 0,
      executionTime: Date.now() - startTime,
      suggestions: await getPopularSearches(tenantId),
    };
  }

  // Detect search intent
  const intent = detectIntent(sanitizedQuery);

  let results: SearchResult[] = [];
  let total = 0;

  switch (intent.type) {
    case 'entity_search':
      // Direct entity search (name, email, phone, VIN, etc.)
      const entityResults = await searchEntities(tenantId, sanitizedQuery, limit, offset);
      results = entityResults.results;
      total = entityResults.total;
      break;

    case 'filter_query':
      // Complex filter query (e.g., "deals over 7 days")
      const filterResults = await executeFilterQuery(tenantId, intent, limit, offset);
      results = filterResults.results;
      total = filterResults.total;
      break;

    case 'analytics':
      // Analytics query (e.g., "average profit this month")
      const analyticsResults = await executeAnalyticsQuery(tenantId, intent);
      results = analyticsResults.results;
      total = analyticsResults.total;
      break;

    default:
      // Fallback to multi-entity search
      const multiResults = await searchEntities(tenantId, sanitizedQuery, limit, offset);
      results = multiResults.results;
      total = multiResults.total;
  }

  const executionTime = Date.now() - startTime;

  // Track search in history
  await trackSearch({
    tenantId,
    userId,
    query: sanitizedQuery,
    parsedQuery: intent,
    resultType: results[0]?.type || 'none',
    resultCount: results.length,
    executionTime,
  });

  // Update popular searches
  await updatePopularSearch(tenantId, sanitizedQuery, results[0]?.type || 'general');

  return {
    results,
    total,
    executionTime,
    suggestions: await generateSuggestions(tenantId, sanitizedQuery),
    parsedQuery: intent,
  };
}

/**
 * Search across multiple entity types
 */
async function searchEntities(
  tenantId: string,
  query: string,
  limit: number,
  offset: number
): Promise<{ results: SearchResult[]; total: number }> {
  const results: SearchResult[] = [];

  // Parallel search across all entity types
  const [customers, vehicles, deals, leads] = await Promise.all([
    searchCustomers(tenantId, query, limit),
    searchVehicles(tenantId, query, limit),
    searchDeals(tenantId, query, limit),
    searchLeads(tenantId, query, limit),
  ]);

  // Combine and rank results
  results.push(...customers, ...vehicles, ...deals, ...leads);

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  // Apply pagination
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: results.length,
  };
}

/**
 * Search customers by name, email, phone
 */
async function searchCustomers(tenantId: string, query: string, limit: number): Promise<SearchResult[]> {
  const customers = await db.$queryRaw<any[]>`
    SELECT
      c.id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.mobile,
      c.credit_score,
      c.lead_status,
      ts_rank(
        to_tsvector('english',
          COALESCE(c.first_name, '') || ' ' ||
          COALESCE(c.last_name, '') || ' ' ||
          COALESCE(c.email, '') || ' ' ||
          COALESCE(c.phone, '') || ' ' ||
          COALESCE(c.mobile, '')
        ),
        to_tsquery('english', ${query.split(' ').join(' & ')})
      ) as rank
    FROM customers c
    WHERE c.tenant_id = ${tenantId}
      AND (
        to_tsvector('english',
          COALESCE(c.first_name, '') || ' ' ||
          COALESCE(c.last_name, '') || ' ' ||
          COALESCE(c.email, '') || ' ' ||
          COALESCE(c.phone, '') || ' ' ||
          COALESCE(c.mobile, '')
        ) @@ to_tsquery('english', ${query.split(' ').join(' & ')})
        OR c.first_name ILIKE ${`%${query}%`}
        OR c.last_name ILIKE ${`%${query}%`}
        OR c.email ILIKE ${`%${query}%`}
        OR c.phone ILIKE ${`%${query}%`}
        OR c.mobile ILIKE ${`%${query}%`}
      )
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  return customers.map((c) => ({
    type: 'customer' as const,
    id: c.id,
    score: parseFloat(c.rank || 0.5),
    data: {
      name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      phone: c.phone || c.mobile,
      creditScore: c.credit_score,
      status: c.lead_status,
    },
    url: `/customers/detail/${c.id}`,
  }));
}

/**
 * Search vehicles by make, model, VIN, stock number
 */
async function searchVehicles(tenantId: string, query: string, limit: number): Promise<SearchResult[]> {
  const vehicles = await db.$queryRaw<any[]>`
    SELECT
      v.id,
      v.year,
      v.make,
      v.model,
      v.trim,
      v.vin,
      v.stock_number,
      v.status,
      v.asking_price,
      v.created_at,
      ts_rank(
        to_tsvector('english',
          COALESCE(v.make, '') || ' ' ||
          COALESCE(v.model, '') || ' ' ||
          COALESCE(v.trim, '') || ' ' ||
          COALESCE(v.vin, '') || ' ' ||
          COALESCE(v.stock_number, '')
        ),
        to_tsquery('english', ${query.split(' ').join(' & ')})
      ) as rank
    FROM vehicles v
    WHERE v.tenant_id = ${tenantId}
      AND (
        to_tsvector('english',
          COALESCE(v.make, '') || ' ' ||
          COALESCE(v.model, '') || ' ' ||
          COALESCE(v.trim, '') || ' ' ||
          COALESCE(v.vin, '') || ' ' ||
          COALESCE(v.stock_number, '')
        ) @@ to_tsquery('english', ${query.split(' ').join(' & ')})
        OR v.make ILIKE ${`%${query}%`}
        OR v.model ILIKE ${`%${query}%`}
        OR v.vin ILIKE ${`%${query}%`}
        OR v.stock_number ILIKE ${`%${query}%`}
      )
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  return vehicles.map((v) => ({
    type: 'vehicle' as const,
    id: v.id,
    score: parseFloat(v.rank || 0.5),
    data: {
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      vin: v.vin,
      stockNumber: v.stock_number,
      status: v.status,
      price: v.asking_price,
      daysInStock: Math.floor((Date.now() - new Date(v.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    },
    url: `/inventory/detail/${v.id}`,
  }));
}

/**
 * Search deals
 */
async function searchDeals(tenantId: string, query: string, limit: number): Promise<SearchResult[]> {
  // Search deals by customer name or deal ID
  const deals = await db.deal.findMany({
    where: {
      tenantId,
      OR: [
        { id: { contains: query, mode: 'insensitive' } },
        {
          customer: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      ],
    },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      vehicle: { select: { year: true, make: true, model: true } },
    },
    take: limit,
  });

  return deals.map((d) => ({
    type: 'deal' as const,
    id: d.id,
    score: 0.7,
    data: {
      customer: `${d.customer.firstName} ${d.customer.lastName}`,
      vehicle: d.vehicle ? `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}` : null,
      stage: d.stage,
      status: d.status,
      amount: d.sellingPrice,
      createdAt: d.createdAt,
    },
    url: `/deals/${d.id}`,
  }));
}

/**
 * Search leads
 */
async function searchLeads(tenantId: string, query: string, limit: number): Promise<SearchResult[]> {
  const leads = await db.lead.findMany({
    where: {
      tenantId,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
  });

  return leads.map((l) => ({
    type: 'lead' as const,
    id: l.id,
    score: 0.6,
    data: {
      name: `${l.firstName} ${l.lastName}`,
      email: l.email,
      phone: l.phone,
      status: l.status,
      leadScore: l.leadScore,
      source: l.source,
    },
    url: `/crm/leads/${l.id}`,
  }));
}

/**
 * Detect search intent from query
 */
function detectIntent(query: string): any {
  const lowerQuery = query.toLowerCase();

  // Check for filter keywords
  if (
    lowerQuery.includes('more than') ||
    lowerQuery.includes('less than') ||
    lowerQuery.includes('over') ||
    lowerQuery.includes('under') ||
    lowerQuery.includes('older than') ||
    lowerQuery.includes('newer than')
  ) {
    return { type: 'filter_query', query };
  }

  // Check for analytics keywords
  if (
    lowerQuery.includes('average') ||
    lowerQuery.includes('total') ||
    lowerQuery.includes('sum') ||
    lowerQuery.includes('count')
  ) {
    return { type: 'analytics', query };
  }

  // Default to entity search
  return { type: 'entity_search', query };
}

/**
 * Execute filter query (complex filtering)
 */
async function executeFilterQuery(
  tenantId: string,
  intent: any,
  limit: number,
  offset: number
): Promise<{ results: SearchResult[]; total: number }> {
  // TODO: Implement NLP parsing and filter execution
  // For now, return empty results
  return { results: [], total: 0 };
}

/**
 * Execute analytics query
 */
async function executeAnalyticsQuery(
  tenantId: string,
  intent: any
): Promise<{ results: SearchResult[]; total: number }> {
  // TODO: Implement analytics query execution
  return { results: [], total: 0 };
}

/**
 * Track search in history
 */
async function trackSearch(data: {
  tenantId: string;
  userId: string;
  query: string;
  parsedQuery: any;
  resultType: string;
  resultCount: number;
  executionTime: number;
}): Promise<void> {
  await db.searchQuery.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      query: data.query,
      parsedQuery: data.parsedQuery,
      resultType: data.resultType,
      resultCount: data.resultCount,
      executionTime: data.executionTime,
    },
  });
}

/**
 * Update popular search cache
 */
async function updatePopularSearch(tenantId: string, query: string, category: string): Promise<void> {
  await db.popularSearch.upsert({
    where: {
      tenantId_query: { tenantId, query },
    },
    update: {
      count: { increment: 1 },
      lastUsed: new Date(),
    },
    create: {
      tenantId,
      query,
      category,
      count: 1,
    },
  });
}

/**
 * Get popular searches for suggestions
 */
export async function getPopularSearches(tenantId: string, limit = 10): Promise<string[]> {
  const popular = await db.popularSearch.findMany({
    where: { tenantId },
    orderBy: { count: 'desc' },
    take: limit,
    select: { query: true },
  });

  return popular.map((p) => p.query);
}

/**
 * Generate search suggestions
 */
async function generateSuggestions(tenantId: string, query: string): Promise<string[]> {
  // Get popular searches that match query
  const popular = await db.popularSearch.findMany({
    where: {
      tenantId,
      query: { contains: query, mode: 'insensitive' },
    },
    orderBy: { count: 'desc' },
    take: 5,
    select: { query: true },
  });

  const suggestions = popular.map((p) => p.query);

  // Add common query templates if not enough suggestions
  if (suggestions.length < 3) {
    const templates = [
      `${query} this week`,
      `${query} this month`,
      `pending ${query}`,
      `active ${query}`,
    ];
    suggestions.push(...templates.slice(0, 5 - suggestions.length));
  }

  return suggestions;
}

/**
 * Get recent searches for user
 */
export async function getRecentSearches(
  tenantId: string,
  userId: string,
  limit = 10
): Promise<Array<{ query: string; timestamp: Date; type: string }>> {
  const recent = await db.searchQuery.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      query: true,
      createdAt: true,
      resultType: true,
    },
  });

  return recent.map((r) => ({
    query: r.query,
    timestamp: r.createdAt,
    type: r.resultType,
  }));
}
