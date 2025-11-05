# Intelligent NLP Search Architecture

## Overview

An AI-powered universal search bar that understands natural language queries and searches across all dealership data: customers, vehicles, deals, leads, inventory, and more.

---

## Search Capabilities

### 1. **Entity Search**
- **Customers**: "John Smith", "555-1234", "john@email.com"
- **Vehicles**: "2023 Honda Accord", "VIN 1HGBH41JXMN109186", "red sedans"
- **Deals**: "deal #12345", "deals over $50k", "pending deals"
- **Leads**: "hot leads", "leads from website", "uncontacted leads"

### 2. **Natural Language Queries**
```
"Show me appraisals that were more than $1000 low"
"Deals older than 7 days"
"Customers with credit score above 700"
"Vehicles in stock over 60 days"
"Sales by John Doe this month"
"All pending service appointments"
"Trade-ins valued over $20k"
"Deals closed yesterday"
```

### 3. **Analytical Queries**
```
"Average deal profit last week"
"Total inventory value"
"Conversion rate this month"
"Top 5 salespeople"
"Vehicles that need repricing"
```

### 4. **Smart Filters**
- Date ranges: "last week", "this month", "Q1 2024"
- Comparisons: "more than", "less than", "between"
- Status filters: "active", "pending", "closed", "archived"
- User filters: "assigned to me", "my deals", "my customers"

---

## Architecture

### Component Stack

```
┌─────────────────────────────────────────────┐
│         Frontend Search Bar                  │
│  - Input with suggestions                    │
│  - Recent searches                           │
│  - Quick filters                             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      Backend Search API (Express)            │
│  /api/search                                 │
│  - Request validation                        │
│  - Cache layer (Redis)                       │
│  - Search orchestration                      │
└──────────────┬──────────────┬────────────────┘
               │              │
               ▼              ▼
    ┌──────────────┐   ┌──────────────┐
    │ NLP Service  │   │ Direct Search│
    │ (Python ML)  │   │ (PostgreSQL) │
    └──────┬───────┘   └──────┬───────┘
           │                  │
           ▼                  │
    ┌──────────────┐          │
    │ Intent Parser│          │
    │ - spaCy NLP  │          │
    │ - Entity ext │          │
    │ - Query gen  │          │
    └──────┬───────┘          │
           │                  │
           ▼                  │
    ┌──────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│         Query Executor (Prisma)              │
│  - Build dynamic queries                     │
│  - Apply permissions/tenant filters          │
│  - Execute & format results                  │
└─────────────────────────────────────────────┘
```

---

## Database Schema

### Search History Table

```prisma
model SearchQuery {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  userId      String   @map("user_id")
  query       String   // Original query text
  parsedQuery Json?    // Parsed NLP structure
  resultType  String   @map("result_type") // customers, vehicles, deals, etc.
  resultCount Int      @map("result_count")
  executionTime Int    @map("execution_time") // milliseconds
  clicked     Boolean  @default(false) // Did user click a result?
  createdAt   DateTime @default(now()) @map("created_at")

  user   User   @relation(fields: [userId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, userId])
  @@index([tenantId, createdAt])
  @@map("search_queries")
}

// Popular searches cache
model PopularSearch {
  id          String   @id @default(cuid())
  tenantId    String?  @map("tenant_id") // null = global
  query       String   @unique
  category    String   // customer, vehicle, deal, report
  count       Int      @default(1)
  lastUsed    DateTime @default(now()) @map("last_used")

  tenant Tenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, category])
  @@map("popular_searches")
}
```

---

## NLP Query Parser (Python/spaCy)

### Intent Classification

```python
class SearchIntent(Enum):
    ENTITY_SEARCH = "entity_search"       # Find specific customer/vehicle
    LIST_FILTER = "list_filter"           # Filter with conditions
    ANALYTICS = "analytics"               # Run calculations
    REPORT = "report"                     # Generate report
    NAVIGATION = "navigation"             # Go to page
```

### Entity Extraction

```python
{
  "intent": "list_filter",
  "entity": "appraisals",
  "filters": [
    {
      "field": "variance",
      "operator": "less_than",
      "value": -1000,
      "text": "more than $1000 low"
    }
  ],
  "sort": None,
  "limit": None
}
```

### Query Examples

**Input:** "Show me appraisals that were more than $1000 low"
```json
{
  "intent": "list_filter",
  "entity": "appraisals",
  "filters": [
    {
      "field": "estimatedValue",
      "operator": "lt",
      "value": {
        "type": "field_comparison",
        "compareField": "payoffAmount",
        "offset": -1000
      }
    }
  ]
}
```

**Input:** "Deals older than 7 days"
```json
{
  "intent": "list_filter",
  "entity": "deals",
  "filters": [
    {
      "field": "createdAt",
      "operator": "lt",
      "value": {
        "type": "date_offset",
        "days": -7
      }
    }
  ]
}
```

**Input:** "John Smith"
```json
{
  "intent": "entity_search",
  "entity": "multi",
  "searchTerm": "John Smith",
  "searchIn": ["customers", "users", "deals"]
}
```

---

## Backend API Design

### Endpoints

#### 1. `/api/search` - Universal Search
```typescript
POST /api/search
{
  "query": "appraisals more than $1000 low",
  "filters": {
    "dateRange": "last_30_days",
    "status": ["pending", "completed"]
  },
  "limit": 20,
  "offset": 0
}

Response:
{
  "results": [
    {
      "type": "appraisal",
      "id": "appr_123",
      "data": {
        "vehicle": { "year": 2020, "make": "Honda", "model": "Civic" },
        "estimatedValue": 18000,
        "payoffAmount": 19500,
        "variance": -1500,
        "customer": { "name": "John Doe" }
      },
      "score": 0.95
    }
  ],
  "total": 45,
  "executionTime": 125,
  "parsedQuery": { ... },
  "suggestions": ["appraisals over $2000 low", "appraisals this week"]
}
```

#### 2. `/api/search/suggestions` - Autocomplete
```typescript
GET /api/search/suggestions?q=deal

Response:
{
  "suggestions": [
    { "text": "deals over $50k", "category": "filter", "count": 12 },
    { "text": "deals closed today", "category": "filter", "count": 8 },
    { "text": "deal #12345", "category": "entity", "type": "deal" }
  ]
}
```

#### 3. `/api/search/recent` - Recent Searches
```typescript
GET /api/search/recent?limit=10

Response:
{
  "recent": [
    { "query": "John Smith", "timestamp": "2024-11-05T10:30:00Z", "type": "customer" },
    { "query": "deals over 7 days", "timestamp": "2024-11-05T09:15:00Z", "type": "deals" }
  ]
}
```

#### 4. `/api/search/popular` - Popular Searches
```typescript
GET /api/search/popular?category=deals

Response:
{
  "popular": [
    { "query": "pending deals", "count": 450 },
    { "query": "deals this week", "count": 320 },
    { "query": "deals over $50k", "count": 180 }
  ]
}
```

---

## Query Builder

### Prisma Query Generation

```typescript
interface ParsedFilter {
  field: string;
  operator: 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'contains' | 'in';
  value: any;
}

function buildPrismaQuery(entity: string, filters: ParsedFilter[]) {
  const where: any = {};

  filters.forEach(filter => {
    switch (filter.operator) {
      case 'lt':
        where[filter.field] = { lt: filter.value };
        break;
      case 'contains':
        where[filter.field] = { contains: filter.value, mode: 'insensitive' };
        break;
      // ... more operators
    }
  });

  return prisma[entity].findMany({ where, take: 20 });
}
```

### Example Queries

```typescript
// "Customers with credit score above 700"
prisma.customer.findMany({
  where: {
    tenantId: req.tenantId,
    creditScore: { gt: 700 }
  },
  take: 20
});

// "Vehicles in stock over 60 days"
prisma.vehicle.findMany({
  where: {
    tenantId: req.tenantId,
    status: 'available',
    createdAt: { lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
  },
  take: 20
});

// "Appraisals more than $1000 low"
prisma.$queryRaw`
  SELECT * FROM appraisals
  WHERE tenant_id = ${req.tenantId}
    AND (estimated_value - payoff_amount) < -1000
  LIMIT 20
`;
```

---

## Frontend Components

### 1. **IntelligentSearchBar** (Header Component)

```typescript
<IntelligentSearchBar
  placeholder="Search customers, deals, vehicles... or ask a question"
  onSearch={(query) => handleSearch(query)}
  suggestions={suggestions}
  recentSearches={recentSearches}
  shortcuts={[
    { label: "My Deals", query: "deals assigned to me" },
    { label: "Hot Leads", query: "hot leads" },
    { label: "Aging Inventory", query: "vehicles over 60 days" }
  ]}
/>
```

### 2. **SearchResults** (Modal/Page)

```typescript
<SearchResults
  query={query}
  results={results}
  total={total}
  onResultClick={(result) => navigate(result.url)}
  filters={availableFilters}
  onFilterChange={(filters) => refineSearch(filters)}
/>
```

### 3. **SearchSuggestions** (Dropdown)

```typescript
<SearchSuggestions
  query={query}
  suggestions={[
    { type: "entity", text: "John Smith", icon: "user", count: 1 },
    { type: "filter", text: "deals over $50k", icon: "filter", count: 12 },
    { type: "recent", text: "appraisals low", icon: "clock" }
  ]}
  onSelect={(suggestion) => executeSearch(suggestion)}
/>
```

---

## Smart Features

### 1. **Context-Aware Suggestions**
- If on Customers page → prioritize customer queries
- If on Deals page → prioritize deal queries
- Based on user role → show relevant searches

### 2. **Voice Search**
```typescript
<SearchBar
  enableVoice={true}
  onVoiceInput={(transcript) => processVoiceSearch(transcript)}
/>
```

### 3. **Keyboard Shortcuts**
- `Cmd/Ctrl + K` - Open search
- `Cmd/Ctrl + Shift + F` - Advanced search
- `Arrow keys` - Navigate suggestions
- `Enter` - Execute search

### 4. **Search History with Metadata**
```typescript
{
  query: "deals over 7 days",
  timestamp: "2024-11-05T10:30:00Z",
  resultCount: 23,
  clicked: true,
  executionTime: 145
}
```

### 5. **Intelligent Result Ranking**
- Exact matches (ID, email, phone) → Top priority
- Partial matches → Medium priority
- Related entities → Lower priority
- Recently accessed → Boost score

---

## Performance Optimizations

### 1. **Caching Strategy** (Redis)
```typescript
// Cache popular queries (5 min TTL)
const cacheKey = `search:${tenantId}:${queryHash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Execute and cache
const results = await executeSearch(query);
await redis.setex(cacheKey, 300, JSON.stringify(results));
```

### 2. **Database Indexes**
```sql
-- Full-text search indexes
CREATE INDEX idx_customers_search ON customers USING gin(
  to_tsvector('english', first_name || ' ' || last_name || ' ' || email || ' ' || phone)
);

CREATE INDEX idx_vehicles_search ON vehicles USING gin(
  to_tsvector('english', make || ' ' || model || ' ' || vin || ' ' || stock_number)
);

-- Filter indexes
CREATE INDEX idx_deals_created ON deals(tenant_id, created_at DESC);
CREATE INDEX idx_customers_credit ON customers(tenant_id, credit_score);
CREATE INDEX idx_vehicles_age ON vehicles(tenant_id, created_at);
```

### 3. **Debouncing & Throttling**
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => fetchSuggestions(query), 300),
  []
);
```

---

## Security & Permissions

### 1. **Permission Filtering**
```typescript
// Automatically filter by user permissions
const results = await searchEngine.search(query, {
  tenantId: req.tenantId,
  userId: req.userId,
  permissions: req.permissions
});

// Backend applies filters
if (!hasPermission('customers.view')) {
  delete results.customers;
}
```

### 2. **Tenant Isolation**
All queries automatically scoped by `tenantId`:
```typescript
where: {
  tenantId: req.tenantId,
  ...filters
}
```

### 3. **Query Sanitization**
```typescript
// Prevent SQL injection
const sanitized = query
  .replace(/[^a-zA-Z0-9\s@.-]/g, '')
  .trim()
  .slice(0, 200);
```

---

## Example Use Cases

### Use Case 1: Find Undervalued Trade-Ins
**Query:** "Show me appraisals that were more than $1000 low"
**Result:** List of appraisals where `estimatedValue - payoffAmount < -1000`

### Use Case 2: Aging Deals
**Query:** "Deals older than 7 days"
**Result:** All deals with `createdAt < Date.now() - 7 days`

### Use Case 3: High-Value Customers
**Query:** "Customers with credit score above 700"
**Result:** Customers with `creditScore > 700`

### Use Case 4: Stale Inventory
**Query:** "Vehicles in stock over 60 days"
**Result:** Vehicles with `status = 'available'` and `daysInStock > 60`

### Use Case 5: Sales Performance
**Query:** "Sales by John Doe this month"
**Result:** Deals where `salesperson = 'John Doe'` and `closedAt >= startOfMonth`

---

## Implementation Phases

### Phase 1: Basic Search (Week 1)
- ✅ Database schema (SearchQuery, PopularSearch)
- ✅ Backend API endpoints
- ✅ Simple text search (customers, vehicles, deals)
- ✅ Frontend search bar component
- ✅ Autocomplete suggestions

### Phase 2: NLP Integration (Week 2)
- Python NLP service with spaCy
- Intent classification
- Entity extraction
- Query parser
- ML service integration

### Phase 3: Advanced Queries (Week 3)
- Complex filters (date ranges, comparisons)
- Multi-entity search
- Analytical queries
- Report generation
- Search history tracking

### Phase 4: Intelligence (Week 4)
- Context-aware suggestions
- Query learning from history
- Popular searches
- Voice search
- Keyboard shortcuts

---

## Technology Stack

**Backend:**
- Express.js (API)
- Prisma (ORM)
- Redis (Cache)
- PostgreSQL (Full-text search)

**NLP/ML:**
- Python FastAPI
- spaCy (NLP)
- scikit-learn (Classification)
- NLTK (Text processing)

**Frontend:**
- React 18
- TanStack Query
- Radix UI (Combobox)
- React Hook Form
- Zustand (State)

---

## Success Metrics

- **Search Usage:** 500+ searches/day
- **Query Success Rate:** >90% of searches return results
- **Click-Through Rate:** >60% of results clicked
- **Response Time:** <200ms for cached, <500ms for complex
- **NLP Accuracy:** >85% intent classification accuracy

---

**Next Steps:** Start with Phase 1 implementation →
