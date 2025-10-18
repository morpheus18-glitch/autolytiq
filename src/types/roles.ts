export const Roles = ['ADMIN', 'BDC', 'SALES', 'SERVICE'] as const;

export type Role = (typeof Roles)[number];
