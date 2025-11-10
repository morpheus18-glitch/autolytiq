# Go Backend Migration Plan

## Migration Strategy: Incremental Replacement

**Timeline**: 2-3 weeks
**Approach**: Build Go backend in parallel, test thoroughly, then switch over

---

## Phase 1: Foundation (Days 1-3)

### Day 1: Project Setup ✅ COMPLETED
- [x] Create `/apps/backend-go` directory structure
- [x] Initialize Go module (`go mod init github.com/autolytiq/backend`)
- [x] Set up project structure:
  ```
  apps/backend-go/
  ├── cmd/
  │   └── server/
  │       └── main.go           # Entry point
  ├── internal/
  │   ├── config/               # Configuration
  │   ├── middleware/           # Auth, CORS, logging
  │   ├── models/               # Database models
  │   ├── handlers/             # HTTP handlers (controllers)
  │   ├── services/             # Business logic
  │   ├── repository/           # Data access layer
  │   └── utils/                # Helpers
  ├── pkg/
  │   ├── auth/                 # JWT utilities
  │   └── database/             # DB connection
  ├── migrations/               # SQL migrations
  ├── go.mod
  ├── go.sum
  └── Dockerfile
  ```
- [x] Install core dependencies:
  ```bash
  go get github.com/gofiber/fiber/v2
  go get github.com/jackc/pgx/v5
  go get github.com/golang-jwt/jwt/v5
  go get github.com/google/uuid
  go get github.com/joho/godotenv
  go get entgo.io/ent/cmd/ent
  ```
- [x] Create cmd/server/main.go with basic Fiber server
- [x] Add .env file with configuration
- [x] Add Dockerfile for production deployment
- [x] Test server startup (✅ Running on port 3001)

### Day 2: Database Layer ✅ COMPLETE
- [x] Set up `ent` ORM (similar to Prisma)
- [x] Port Prisma schema to Ent schema (9 models = 11% of 84):
  - [x] **Core** (6): Tenant, User, Customer, Vehicle, Deal, Lead
  - [x] **Phase 2** (3): TradeIn, Notification, Note
- [x] Generate Ent code (✅ **86 files generated**)
- [x] Create database connection pool (pkg/database)
- [ ] Implement multi-tenancy middleware (Day 3)
- [ ] Integrate with Fiber server (Day 3)

### Day 3: Authentication ✅ COMPLETE
- [x] JWT RS256 verification middleware (internal/middleware/auth.go)
- [x] Tenant isolation middleware (internal/middleware/tenant.go)
- [x] User context injection (via Fiber locals)
- [x] Context helper functions (GetUserID, GetTenantID, GetUserEmail, GetUserRole, GetTenant)
- [x] First API handler (customers List/Get with tenant scoping)
- [x] Wired auth + tenant middleware into main server
- [x] Auto-migration on startup
- [x] Test build (✅ **Compiles successfully**)

---

## Phase 2: Core API Routes (Days 4-8)

### Priority 1: Auth & Users (Day 4)
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/refresh`
- [ ] `POST /api/auth/switch-tenant`
- [ ] `GET /api/auth/me`
- [ ] `GET /api/users`
- [ ] `GET /api/users/:id`

### Priority 2: CRM Core (Day 4-5)
**Day 4: Customers API ✅ COMPLETE**
- [x] `GET /api/customers` - List all customers for tenant
- [x] `POST /api/customers` - Create new customer
- [x] `GET /api/customers/:id` - Get single customer
- [x] `PUT /api/customers/:id` - Update customer
- [x] `DELETE /api/customers/:id` - Soft delete customer

**Day 5: Leads API** (TODO)
- [ ] `GET /api/leads`
- [ ] `POST /api/leads`
- [ ] `PUT /api/leads/:id`

### Priority 3: Inventory (Day 6)
- [ ] `GET /api/vehicles`
- [ ] `POST /api/vehicles`
- [ ] `GET /api/vehicles/:id`
- [ ] `PUT /api/vehicles/:id`
- [ ] `DELETE /api/vehicles/:id`
- [ ] `GET /api/vehicles/search`

### Priority 4: Deals (Day 7)
- [ ] `GET /api/deals`
- [ ] `POST /api/deals`
- [ ] `GET /api/deals/:id`
- [ ] `PUT /api/deals/:id`
- [ ] `DELETE /api/deals/:id`
- [ ] `POST /api/deals/:id/submit`

### Priority 5: Remaining Routes (Day 8)
- [ ] Search endpoints
- [ ] Notifications endpoints
- [ ] Activities/timeline endpoints
- [ ] Dashboard/analytics endpoints

---

## Phase 3: Microservice Integration (Day 9)

### gRPC Client for Rust Services
- [ ] Price Engine client (`localhost:50051`)
  - Calculate pricing
  - Get market data
- [ ] Communications Service client (`localhost:50052`)
  - Send SMS
  - Send email
- [ ] Cache Service client (`localhost:50053`)
  - Get/set cache
- [ ] Rate Limiter client (`localhost:50054`)
  - Check rate limit

### HTTP Client for Python ML Service
- [ ] Deal optimization endpoint
- [ ] Lead scoring endpoint
- [ ] Approval prediction endpoint

---

## Phase 4: Testing & Validation (Days 10-12)

### Day 10: Integration Testing
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Verify multi-tenancy isolation
- [ ] Test JWT auth flows
- [ ] Test gRPC communication with Rust

### Day 11: Performance Testing
- [ ] Load test with `k6` or `hey`
- [ ] Compare response times vs Node.js
- [ ] Memory profiling
- [ ] Concurrent request handling

### Day 12: Frontend Integration
- [ ] Update frontend API base URL
- [ ] Test all mobile pages
- [ ] Verify WebSocket connections (if needed)
- [ ] Fix any CORS issues

---

## Phase 5: Deployment & Switchover (Days 13-14)

### Day 13: Docker & Infrastructure
- [ ] Create `Dockerfile` for Go backend
- [ ] Update `docker-compose.yml`
- [ ] Test Docker build
- [ ] Update Kubernetes manifests (if applicable)

### Day 14: Production Switchover
- [ ] Run both backends in parallel for 1 day
- [ ] Monitor logs and errors
- [ ] Switch traffic to Go backend
- [ ] Deprecate Node.js backend
- [ ] Celebrate! 🎉

---

## Tech Stack

### Core Framework
```go
// Fiber (Express-like, fastest)
import "github.com/gofiber/fiber/v2"
```

### ORM
```go
// Ent (code-first, type-safe, Prisma-like)
import "entgo.io/ent"
```

### Database
```go
// pgx (native PostgreSQL driver, fastest)
import "github.com/jackc/pgx/v5"
import "github.com/jackc/pgx/v5/pgxpool"
```

### Auth
```go
// JWT
import "github.com/golang-jwt/jwt/v5"
```

### gRPC
```go
// gRPC client
import "google.golang.org/grpc"
```

### Configuration
```go
// Environment variables
import "github.com/joho/godotenv"
```

---

## Migration Strategy for Ent Schema

### Example: User Model

**Prisma (before):**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?
  firstName String?
  lastName  String?
  role      String   @default("user")
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Ent (after):**
```go
// schema/user.go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
)

type User struct {
    ent.Schema
}

func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("id").Default(cuid.New),
        field.String("email").Unique(),
        field.String("username").Optional(),
        field.String("first_name").Optional(),
        field.String("last_name").Optional(),
        field.String("role").Default("user"),
        field.String("tenant_id"),
        field.Time("created_at").Default(time.Now),
        field.Time("updated_at").UpdateDefault(time.Now),
    }
}

func (User) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("tenant", Tenant.Type).
            Ref("users").
            Field("tenant_id").
            Unique().
            Required(),
    }
}
```

---

## Performance Expectations

### Node.js (Current)
- Response time: ~50-100ms (simple queries)
- Memory: ~200-400MB base
- Throughput: ~5,000 req/s (single core)

### Go (Expected)
- Response time: ~10-30ms (simple queries) **3-5x faster**
- Memory: ~50-100MB base **4x less**
- Throughput: ~20,000 req/s (single core) **4x more**

---

## Risk Mitigation

### What Could Go Wrong?
1. **Schema migration bugs** → Mitigation: Run both backends in parallel for 1 week
2. **JWT verification differences** → Mitigation: Use same RS256 keys, extensive testing
3. **CORS issues** → Mitigation: Configure Fiber CORS middleware identically
4. **gRPC connection issues** → Mitigation: Test Rust service integration early

### Rollback Plan
- Keep Node.js backend running for 2 weeks post-migration
- Use load balancer to quickly switch back if issues
- Database is shared, no data migration needed

---

## Success Metrics

- [ ] All 80+ endpoints ported and tested
- [ ] Auth flow works identically to Node.js
- [ ] Multi-tenancy isolation verified
- [ ] Response times improved by 3x
- [ ] Memory usage reduced by 50%
- [ ] Frontend works without changes
- [ ] All Rust microservices communicate successfully

---

## Next Steps

1. **Create project structure** → I'll scaffold the Go backend now
2. **Port Prisma schema** → Convert to Ent schemas
3. **Implement auth** → JWT middleware
4. **Port API routes** → One module at a time (CRM → Inventory → Deals)
5. **Test & deploy** → Docker + integration testing

**Ready to start?** I'll begin scaffolding the Go backend structure now.
