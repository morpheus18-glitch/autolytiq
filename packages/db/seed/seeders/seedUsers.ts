/**
 * Users Seeder
 * Creates demo users with various roles and permissions
 */

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcryptjs from 'bcryptjs';
import { SEED_CONFIG } from '../config';

interface UserSeedData {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isSuperAdmin?: boolean;
  phone: string;
  featureFlags?: string[];
  permissions?: string[];
  accessOverrides?: {
    homePath?: string;
    allowedRoutes?: string[];
    navigationSections?: string[];
    quickActions?: string[];
  } | null;
}

/**
 * Default user seed data
 * Includes admin, managers, sales, and BDC roles
 */
const USER_SEED_DATA: UserSeedData[] = [
  {
    email: SEED_CONFIG.DEVELOPER_EMAIL,
    username: 'dana.reeves',
    firstName: 'Dana',
    lastName: 'Reeves',
    role: UserRole.ADMIN,
    isSuperAdmin: true,
    phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    featureFlags: ['developer_portal', 'realtime_analytics'],
    permissions: ['*'],
    accessOverrides: {
      homePath: '/ml-developer-admin',
      allowedRoutes: ['*'],
      navigationSections: ['*'],
      quickActions: ['*'],
    },
  },
  {
    email: 'sales.manager@sunrisemotors.demo',
    username: 'jordan.parker',
    firstName: 'Jordan',
    lastName: 'Parker',
    role: UserRole.MANAGER,
    phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    featureFlags: ['sales_assistant'],
  },
  {
    email: 'finance.manager@sunrisemotors.demo',
    username: 'avery.nguyen',
    firstName: 'Avery',
    lastName: 'Nguyen',
    role: UserRole.FINANCE,
    phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    featureFlags: ['finance_dashboard'],
    accessOverrides: {
      homePath: '/finance',
      navigationSections: ['finance', 'reports'],
      quickActions: ['/finance', '/reports'],
      allowedRoutes: [
        '/',
        '/dashboard',
        '/finance',
        '/finance/lenders',
        '/finance/rates',
        '/finance/compliance',
        '/reports',
        '/reports/sales',
        '/reports/inventory',
      ],
    },
  },
  {
    email: 'sales1@sunrisemotors.demo',
    username: 'taylor.stone',
    firstName: 'Taylor',
    lastName: 'Stone',
    role: UserRole.SALES,
    phone: faker.helpers.replaceSymbols('+1-###-###-####'),
  },
  {
    email: 'sales2@sunrisemotors.demo',
    username: 'morgan.lee',
    firstName: 'Morgan',
    lastName: 'Lee',
    role: UserRole.SALES,
    phone: faker.helpers.replaceSymbols('+1-###-###-####'),
  },
  {
    email: 'bdc@sunrisemotors.demo',
    username: 'reese.howard',
    firstName: 'Reese',
    lastName: 'Howard',
    role: UserRole.BDC,
    phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    accessOverrides: {
      homePath: '/crm',
      navigationSections: ['crm', 'sales'],
      quickActions: ['/leads', '/customers'],
      allowedRoutes: [
        '/',
        '/crm',
        '/leads',
        '/leads/:id',
        '/customers',
        '/customers/:id',
        '/sales',
        '/sales-mobile',
      ],
    },
  },
];

/**
 * Seed users
 * Creates demo users with hashed passwords
 */
export async function seedUsers(
  prisma: PrismaClient,
  tenantId: string,
  storeId: string
) {
  console.log('\n👥 Seeding users...');

  // Hash password once for all users
  const passwordHash = await bcryptjs.hash(SEED_CONFIG.DEVELOPER_PASSWORD, 12);

  // Create all users in parallel
  const users = await Promise.all(
    USER_SEED_DATA.map((user) =>
      prisma.user.create({
        data: {
          tenantId,
          storeId,
          email: user.email,
          username: user.username ?? user.email.split('@')[0],
          password: passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          permissions:
            user.permissions ??
            (user.role === UserRole.ADMIN
              ? ['*']
              : ['deals:read', 'customers:read']),
          featureFlags: user.featureFlags ?? [],
          accessOverrides: user.accessOverrides ?? null,
          status: UserStatus.ACTIVE,
          isSuperAdmin: user.isSuperAdmin ?? false,
        },
      })
    )
  );

  console.log(`  ✓ Created ${users.length} users`);

  // Group users by role for downstream seeders
  const usersByRole = users.reduce<Record<UserRole, typeof users>>(
    (acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    },
    {} as Record<UserRole, typeof users>
  );

  return { users, usersByRole };
}
