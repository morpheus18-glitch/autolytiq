#!/usr/bin/env node
/**
 * Quick seed script that creates a test user without full Prisma client
 * Uses direct database connection
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function quickSeed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Generate password hash
    const passwordHash = await bcrypt.hash('DevAccess!2024', 12);
    console.log('Password hash generated');

    // Create tenant
    const tenantResult = await client.query(`
      INSERT INTO "Tenant" (id, name, subdomain, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (subdomain) DO UPDATE
      SET "updatedAt" = NOW()
      RETURNING id
    `, ['tenant-sunrise', 'Sunrise Motors', 'sunrise-motors', 'ACTIVE']);

    const tenantId = tenantResult.rows[0].id;
    console.log(`Tenant created/updated: ${tenantId}`);

    // Create developer user
    await client.query(`
      INSERT INTO "User" (
        id, email, username, password, "firstName", "lastName",
        role, status, "tenantId", "isSuperAdmin", permissions, "customPermissions",
        "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET password = EXCLUDED.password, "updatedAt" = NOW()
    `, [
      'user-dev-001',
      'developer@sunrisemotors.demo',
      'dana.reeves',
      passwordHash,
      'Dana',
      'Reeves',
      'ADMIN',
      'ACTIVE',
      tenantId,
      true,
      '{}',
      '{}'
    ]);

    console.log('✓ Developer user created/updated');
    console.log('');
    console.log('Login credentials:');
    console.log('  Store ID: MAIN');
    console.log('  Email: developer@sunrisemotors.demo');
    console.log('  Password: DevAccess!2024');

  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

quickSeed();
