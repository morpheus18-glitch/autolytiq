export type UserRole = 
  | 'SALESPERSON'
  | 'SALES_MANAGER'
  | 'FINANCE_MANAGER'
  | 'GM'
  | 'ADMIN';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
