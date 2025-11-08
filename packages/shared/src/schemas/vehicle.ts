export interface Vehicle {
  id: string;
  tenantId: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage?: number;
  cost?: number;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}
