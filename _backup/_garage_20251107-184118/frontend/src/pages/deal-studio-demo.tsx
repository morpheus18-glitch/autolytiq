/**
 * Deal Studio Demo Page
 *
 * Test page for the Deal Studio desktop experience
 */

import { DealStudioProvider } from '@/contexts/DealStudioContext';
import { DealStudioDesktop } from '@/components/deal-studio/desktop/DealStudioDesktop';

export default function DealStudioDemoPage() {
  // Sample initial deal data
  const initialDeal = {
    vehicleId: 'vehicle-123',
    vehiclePrice: 48900,
    vehicleCost: 32450,
    customerId: 'customer-456',
    creditScore: 680,
    salePrice: 45900,
    downPayment: 3000,
    tradeValue: 22000,
    tradePayoff: 18500,
    term: 60,
    apr: 5.99,
    warranty: 2495,
    gap: 595,
    maintenance: 0,
    paintProtection: 0,
  };

  return (
    <DealStudioProvider initialDeal={initialDeal}>
      <div className="w-full h-screen">
        <DealStudioDesktop fullScreen />
      </div>
    </DealStudioProvider>
  );
}
