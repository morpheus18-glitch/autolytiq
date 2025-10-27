export const Roles = [
  'ADMIN',
  'MANAGER',
  'SALES_MANAGER',
  'FINANCE',
  'FI_MANAGER',
  'SALES',
  'BDC',
  'SERVICE',
] as const;

export type Role = (typeof Roles)[number];
