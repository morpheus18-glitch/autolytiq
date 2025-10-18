# Autolytiq CRM Foundation

This document outlines how to work with the multi-tenant CRM and communication foundation that powers the Autolytiq backend. It covers environment configuration, database schema management, seeding demo data, and running the service locally.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm or npm for package management

## Environment configuration

Copy the `.env.example` file to `.env` and provide real credentials for all required providers.

```bash
cp .env.example .env
```

The backend validates configuration at startup via `backend/src/config/env.ts`. Ensure the following values are set:

- Database: `DATABASE_URL`, `DIRECT_URL`
- JWT / auth: `JWT_PUBLIC_KEY`, `JWT_PRIVATE_KEY`, `JWT_ISSUER`, `JWT_AUDIENCE`, `SESSION_SECRET`
- Messaging: `SENDGRID_API_KEY`, `SENDGRID_FROM`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`, `TWILIO_CALLER_ID`
- Runtime: `APP_URL`, `API_URL`, `SOCKET_IO_CORS_ORIGIN`, optional `ML_SERVICE_URL`

Keys can contain literal `\n` sequences—these are expanded automatically.

## Database workflow

Install dependencies inside the `backend` workspace and push the Prisma schema.

```bash
cd backend
npm install
npm run db:push
```

Generate the Prisma client after any schema change:

```bash
npm run prisma:gen
```

## Seeding demo data

Seed data includes a dealership tenant, role-diverse users, ~30 leads, ~50 activities, ~8 appointments, templated communications, and CRM automations. Run the seed script after pushing the schema:

```bash
npm run db:seed
```

The script is idempotent; rerunning refreshes the `sunrise-motors` tenant with new CRM data.

## Running the backend

Start the development server with Socket.io enabled:

```bash
npm run dev
```

The API listens on the port defined by `PORT` (default `5000`). A Socket.io server is mounted on the same HTTP server, respecting the configured CORS origins.

## Health & tenancy checks

- `GET /api/health` returns `{ ok: true, tenant: null }` unless a tenant scope is active. Include `x-tenant-id` while authenticated to echo the scoped tenant ID.
- Authenticated routes automatically scope Prisma queries to the resolved tenant via middleware in `backend/src/lib/prisma.ts`.
- Use the `/api/crm/leads` endpoint with a role token (`ADMIN`, `MANAGER`, `SALES`, `BDC`, or `SERVICE`) to validate lead aggregation, multi-tenant filtering, and related CRM data hydration.

## Socket.io testing

When connecting a Socket.io client, include `tenantId` in the handshake query. Each connection automatically joins a `tenant:{id}` room for targeted real-time notifications.

## Additional notes

- Super-admin impersonation tokens are signed with the configured RSA private key and validated with the matching public key.
- `backend/src/routes/crm.routes.ts` provides reference implementations for tenant-scoped lead queries using the new schema.
- The Prisma schema and seed live at both the repository root (`prisma/`) and the backend workspace (`backend/prisma/`) to support existing tooling.
