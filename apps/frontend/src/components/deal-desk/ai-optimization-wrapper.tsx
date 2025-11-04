import { useMemo } from 'react';
import { AIAssistant } from './ai-assistant';

interface AIOptimizationWrapperProps {
  selectedVehicle?: any;
  selectedCustomer?: any;
  salePrice: number;
  tradeValue: number;
  tradePayoff: number;
  term: number;
  apr: number;
  cashDown: number;
  products: any[];
  onApplySuggestion: (suggestion: any) => void;
}

export function AIOptimizationWrapper({
  selectedVehicle,
  selectedCustomer,
  salePrice,
  tradeValue,
  tradePayoff,
  term,
  apr,
  cashDown,
  products,
  onApplySuggestion
}: AIOptimizationWrapperProps) {
  // Memoize vehicle info based on primitive dependencies
  const vehicleInfo = useMemo(() => {
    if (!selectedVehicle) return undefined;
    return {
      make: selectedVehicle.make,
      model: selectedVehicle.model,
      year: selectedVehicle.year,
      msrp: selectedVehicle.price,
      cost: selectedVehicle.costPrice || selectedVehicle.price * 0.85
    };
  }, [
    selectedVehicle?.make,
    selectedVehicle?.model,
    selectedVehicle?.year,
    selectedVehicle?.price,
    selectedVehicle?.costPrice
  ]);

  // Memoize customer info
  const customerInfo = useMemo(() => ({
    creditTier: undefined,
    monthlyBudget: undefined,
    downPayment: cashDown,
    zipCode: selectedCustomer?.zipCode
  }), [cashDown, selectedCustomer?.zipCode]);

  // Memoize current deal with products
  const currentDeal = useMemo(() => ({
    salePrice,
    tradeValue,
    tradePayoff,
    term,
    apr,
    products: products.map(p => ({
      name: p.productName,
      retailPrice: p.retailPrice,
      cost: p.cost
    }))
  }), [
    salePrice,
    tradeValue,
    tradePayoff,
    term,
    apr,
    // Create stable products key
    products.map(p => `${p.productName}:${p.retailPrice}:${p.cost}`).join('|')
  ]);

  return (
    <AIAssistant
      vehicleInfo={vehicleInfo}
      customerInfo={customerInfo}
      currentDeal={currentDeal}
      marketValue={undefined}
      onApplySuggestion={onApplySuggestion}
    />
  );
}
