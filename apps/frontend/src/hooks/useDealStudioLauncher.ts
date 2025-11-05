/**
 * Deal Studio Launcher Hook
 *
 * Global hook to launch Deal Studio from anywhere in the app
 * Pre-populates customer, vehicle, or trade-in data
 *
 * Usage:
 *   const { openDealStudio } = useDealStudioLauncher();
 *   openDealStudio({ customerId: '123' });
 *   openDealStudio({ vehicleId: '456' });
 *   openDealStudio({ customerId: '123', vehicleId: '456' });
 */

import { useCallback } from 'react';
import { useDealStudio } from '@/contexts/DealStudioContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface LaunchOptions {
  customerId?: string;
  vehicleId?: string;
  tradeId?: string;
  /** Open on mobile or desktop */
  platform?: 'mobile' | 'desktop' | 'auto';
}

export function useDealStudioLauncher() {
  const { updateDeal, openStudio } = useDealStudio();
  const [, setLocation] = useLocation();

  const openDealStudio = useCallback(async (options: LaunchOptions = {}) => {
    const { customerId, vehicleId, tradeId, platform = 'auto' } = options;

    try {
      // Fetch customer data if provided
      if (customerId) {
        const customerResponse = await apiRequest('GET', `/api/customers/${customerId}`);
        const customer = customerResponse.data;

        updateDeal({
          customerId: customer.id,
          creditScore: customer.creditScore || 700,
        });

        // Auto-calculate taxes if customer has zip
        if (customer.addressZip) {
          // Will be calculated after vehicle is loaded
        }
      }

      // Fetch vehicle data if provided
      if (vehicleId) {
        const vehicleResponse = await apiRequest('GET', `/api/vehicles/${vehicleId}`);
        const vehicle = vehicleResponse.data;

        updateDeal({
          vehicleId: vehicle.id,
          vehiclePrice: vehicle.price,
          vehicleCost: vehicle.cost,
          salePrice: vehicle.price,
        });

        // Auto-calculate taxes if we have customer zip
        if (customerId) {
          const customerResponse = await apiRequest('GET', `/api/customers/${customerId}`);
          const customer = customerResponse.data;

          if (customer.addressZip) {
            const taxResult = await apiRequest('POST', '/api/desking/calculate-tax', {
              salePrice: vehicle.price,
              zipCode: customer.addressZip,
            });

            if (taxResult?.data) {
              updateDeal({
                taxes: taxResult.data.salesTaxAmount,
                fees: taxResult.data.docFee + taxResult.data.titleFee +
                      taxResult.data.registrationFee + taxResult.data.plateFee,
              });
            }
          }
        }
      }

      // Fetch trade-in data if provided
      if (tradeId) {
        // TODO: Implement trade-in API
        // const tradeResponse = await apiRequest('GET', `/api/trade-ins/${tradeId}`);
        // updateDeal({ tradeValue: trade.acv, tradePayoff: trade.payoff });
      }

      // Determine platform
      const isMobile = platform === 'mobile' ||
                      (platform === 'auto' && window.innerWidth < 768);

      // Navigate to appropriate Deal Studio
      if (isMobile) {
        setLocation('/deal-studio-mobile-demo');
      } else {
        setLocation('/deal-studio-demo');
      }

      // Open studio if using context-based approach
      if (openStudio) {
        openStudio();
      }

    } catch (error) {
      console.error('Failed to launch Deal Studio:', error);
      // Fallback: navigate anyway
      setLocation('/deal-studio-demo');
    }
  }, [updateDeal, openStudio, setLocation]);

  return {
    openDealStudio,
  };
}
