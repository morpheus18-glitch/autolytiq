
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calculator, 
  Car, 
  DollarSign,
  User,
  Save,
  Printer,
  CheckCircle,
  Loader2,
  Package,
  TrendingUp,
  FileText,
  Plus,
  X,
  Eye,
  EyeOff,
  ClipboardList,
  FileDown
} from 'lucide-react';
import { TradeSection } from '@/components/deal-desk/trade-section';
import { FeesSection, type DealFee } from '@/components/deal-desk/fees-section';
import { FinanceSection } from '@/components/deal-desk/finance-section';
import { ProductsSection, type DealProduct } from '@/components/deal-desk/products-section';
import { KPICards } from '@/components/deal-desk/kpi-cards';
import { AIOptimizationWrapper } from '@/components/deal-desk/ai-optimization-wrapper';
import { LenderMatcher } from '@/components/deal-desk/lender-matcher';
import { PaymentScenarios } from '@/components/deal-desk/payment-scenarios';
import { ProfitOptimizer } from '@/components/deal-desk/profit-optimizer';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  stockNo: string;
  price: number;
  costPrice: number;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode?: string | null;
  city?: string | null;
  state?: string | null;
  creditScore?: number | null;
  creditTier?: string | null;
}

interface JurisdictionOption {
  id: number;
  display: string;
  city?: string | null;
  county?: string | null;
  state: string;
  zip: string;
}

interface TradeVehicleRecord {
  id: number;
  customerId: number;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  vin?: string | null;
  mileage?: number | null;
  estimatedValue?: number | string | null;
  actualValue?: number | string | null;
  status?: string | null;
}

const creditScoreToTier = (score: number) => {
  if (score >= 780) return 'A+';
  if (score >= 720) return 'A';
  if (score >= 660) return 'B';
  if (score >= 620) return 'C';
  return 'D';
};

const moneyValueToCents = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100);
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return Math.round(parsed * 100);
    }
  }

  return null;
};

interface Deal {
  id?: string;
  dealNumber?: string;
  status: string;
  vehicleId?: number;
  customerId?: number;
  buyerName: string;
  dealType: 'retail' | 'lease' | 'cash';
  salePrice: number;
  cashDown: number;
  rebates: number;
  tradeAllowance: number;
  tradePayoff: number;
  salesTax: number;
  docFee: number;
  titleFee: number;
  registrationFee: number;
  financeBalance: number;
  term?: number;
  rate?: string;
  creditTier?: string;
}

interface BackendProduct {
  id?: string;
  productName: string;
  retailPrice: number;
  cost: number;
  category: string;
}

interface DealCalculation {
  jurisdiction: JurisdictionOption;
  calculation: {
    fees: {
      nontaxFees: number;
      lineItems: Array<{ code: string; label: string; amount: number }>;
    };
    taxes: {
      totalTax: number;
      lineItems: Array<{ label: string; rate: number; amount: number }>;
    };
    totals: {
      vehiclePrice: number;
      totalTax: number;
      grandTotal: number;
    };
    profit?: {
      frontEnd: number;
      backEnd: number;
      total: number;
    };
  };
}

interface AftermarketItem {
  id: string;
  description: string;
  amount: number;
}

export default function ProfessionalDealDesk() {
  const { toast } = useToast();
  const [location] = useLocation();
  const { trackInteraction, setTrackedCustomer } = usePixelTracker();
  
  // Core deal state
  const [dealId, setDealId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerZip, setCustomerZip] = useState('');
  const [jurisdictionData, setJurisdictionData] = useState<JurisdictionOption[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionOption | null>(null);
  const [jurisdictionManuallySet, setJurisdictionManuallySet] = useState(false);
  
  // Deal structure
  const [dealType, setDealType] = useState<'retail' | 'lease' | 'cash'>('retail');
  const [salePrice, setSalePrice] = useState(0);
  const [vehicleCost, setVehicleCost] = useState(0);
  const [cashDown, setCashDown] = useState(0);
  const [rebates, setRebates] = useState(0);
  
  // Trade-in
  const [tradeValue, setTradeValue] = useState(0);
  const [tradePayoff, setTradePayoff] = useState(0);
  
  // Financing
  const [term, setTerm] = useState(72);
  const [apr, setApr] = useState(6.99);
  const [creditTier, setCreditTier] = useState<string>('A');
  
  // Backend products
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [aftermarketItems, setAftermarketItems] = useState<AftermarketItem[]>([]);
  
  // New F&I fields (cents-based)
  const [msrpCents, setMsrpCents] = useState<number | null>(null);
  const [packCents, setPackCents] = useState<number | null>(null);
  const [holdbackCents, setHoldbackCents] = useState<number | null>(null);
  const [rebatesCents, setRebatesCents] = useState<number | null>(null);
  const [rebatesTaxable, setRebatesTaxable] = useState(false);
  
  // Trade fields (cents-based)
  const [tradeAcvCents, setTradeAcvCents] = useState<number | null>(null);
  const [tradeReconCents, setTradeReconCents] = useState<number | null>(null);
  const [tradeAllowanceCents, setTradeAllowanceCents] = useState<number | null>(null);
  const [tradePayoffCents, setTradePayoffCents] = useState<number | null>(null);
  const [payoffGoodThru, setPayoffGoodThru] = useState<string | null>(null);
  const [lienholderName, setLienholderName] = useState<string | null>(null);
  const [titleState, setTitleState] = useState<string | null>(null);
  
  // Finance fields (cents-based)
  const [cashDownCents, setCashDownCents] = useState<number | null>(null);
  const [deferredDownCents, setDeferredDownCents] = useState<number | null>(null);
  const [aprBps, setAprBps] = useState<number | null>(null);
  const [buyRateBps, setBuyRateBps] = useState<number | null>(null);
  const [reserveBasis, setReserveBasis] = useState<string>('None');
  const [reserveAmountCents, setReserveAmountCents] = useState<number | null>(null);
  const [paymentFrequency, setPaymentFrequency] = useState<string>('MONTHLY');

  // Fees and enhanced products
  const [dealFees, setDealFees] = useState<DealFee[]>([]);
  const [enhancedProducts, setEnhancedProducts] = useState<DealProduct[]>([]);

  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [tradeSelectionManuallyCleared, setTradeSelectionManuallyCleared] = useState(false);

  const lastPrefilledCustomerId = useRef<number | null>(null);
  const lastPrefilledTradeId = useRef<number | null>(null);


  const aftermarketTotal = useMemo(
    () => aftermarketItems.reduce((sum, item) => sum + (item.amount || 0), 0),
    [aftermarketItems]
  );

  const addAftermarketItem = useCallback(() => {
    setAftermarketItems((items) => [
      ...items,
      {
        id: `aftermarket-${Date.now()}-${items.length}`,
        description: 'Custom Add',
        amount: 0,
      },
    ]);
  }, []);

  const updateAftermarketItem = useCallback((id: string, updates: Partial<AftermarketItem>) => {
    setAftermarketItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeAftermarketItem = useCallback((id: string) => {
    setAftermarketItems((items) => items.filter((item) => item.id !== id));
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const parseDecimalInput = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.-]/g, '');
    if (sanitized === '' || sanitized === '-' || sanitized === '.') {
      return 0;
    }
    const parsed = parseFloat(sanitized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, []);

  const parseCentsInput = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.-]/g, '');
    if (sanitized === '' || sanitized === '-' || sanitized === '.') {
      return null;
    }
    const parsed = parseFloat(sanitized);
    return Number.isNaN(parsed) ? null : Math.round(parsed * 100);
  }, []);
  
  // UI state
  const [managerMode, setManagerMode] = useState(true); // Manager vs Customer view
  
  // Autosave state
  const [autosaving, setAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // TODO: Proper multi-tenant implementation - fetch user's storeId from session/auth
  // For now, fetch the first available store from the database
  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
    queryFn: async () => {
      const response = await fetch('/api/stores');
      if (!response.ok) return [];
      return response.json();
    }
  });
  
  // Use first store for now (will be replaced with user's authenticated store)
  const storeId = stores[0]?.id || 'store_default';
  
  // Fetch dealer product presets
  const { data: productPresets = [] } = useQuery({
    queryKey: ['/api/dealer-config/products', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/dealer-config/products/${storeId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!storeId
  });
  
  // Fetch dealer finance settings
  const { data: financeSettings } = useQuery({
    queryKey: ['/api/dealer-config/finance', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/dealer-config/finance/${storeId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!storeId
  });
  
  // Set default finance values from dealer settings
  useEffect(() => {
    if (financeSettings && !dealId) { // Only apply defaults for new deals
      if (financeSettings.defaultAPR) {
        setApr(parseFloat(financeSettings.defaultAPR));
      }
      if (financeSettings.defaultTerm) {
        setTerm(financeSettings.defaultTerm);
      }
    }
  }, [financeSettings, dealId]);
  
  // Fetch vehicles
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const {
    data: customerTrades = [],
    isFetching: tradesLoading,
  } = useQuery<TradeVehicleRecord[]>({
    queryKey: ['/api/trade-vehicles', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      try {
        const response = await fetch(`/api/trade-vehicles/${customerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trade vehicles');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching trade vehicles:', error);
        return [];
      }
    },
    enabled: !!customerId,
    staleTime: 30000,
  });

  // Selected vehicle and customer
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedCustomer = customers.find(c => c.id === customerId);

  const tradeVehicleOptions = useMemo(
    () =>
      customerTrades.map((trade) => {
        const allowanceCents = moneyValueToCents(trade.actualValue ?? trade.estimatedValue);
        const allowanceDisplay =
          allowanceCents != null
            ? `Allowance ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(allowanceCents / 100)}`
            : undefined;

        return {
          id: trade.id,
          label: `${trade.year} ${trade.make} ${trade.model}`,
          vin: trade.vin,
          details: allowanceDisplay,
        };
      }),
    [customerTrades]
  );

  const selectedTradeVehicle = useMemo(() => {
    if (selectedTradeId == null) return null;
    return customerTrades.find((trade) => trade.id === selectedTradeId) ?? null;
  }, [customerTrades, selectedTradeId]);

  const hasDealContext = Boolean(selectedCustomer && selectedVehicle);
  
  // Calculate deal - include ALL backend products in vehicle price only (no double-counting)
  const totalBackendProducts = products.reduce((sum, p) => sum + p.retailPrice, 0);
  const normalizedDealType = dealType === 'lease' ? 'lease' : 'purchase';

  const calcInput = {
    zip: customerZip,
    dealType: normalizedDealType,
    vehiclePrice: salePrice + aftermarketTotal + totalBackendProducts, // Includes adds and backend products
    vehicleCost: vehicleCost,
    tradeValue: tradeValue,
    tradePayoff: tradePayoff,
    downPayment: cashDown,
    rebates: rebates,
    warrantyPrice: 0, // Already included in vehiclePrice above
    gapPrice: 0, // Already included in vehiclePrice above
    financeReserveAmount: 0,
    financeReserveType: 'percent' as const,
    jurisdictionId: selectedJurisdiction?.id,
    vin: selectedVehicle?.vin,
  };

  const { data: calc, isLoading: calcLoading } = useQuery<DealCalculation>({
    queryKey: ['/api/deals/calculate', calcInput],
    queryFn: async () => {
      const response = await apiRequest('/api/deals/calculate', {
        method: 'POST',
        body: JSON.stringify(calcInput)
      });
      return response.json();
    },
    enabled: customerZip.length >= 5 && salePrice > 0 && hasDealContext,
    staleTime: 0,
    retry: 1,
  });
  
  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    if (!calc) return 0;
    
    const netTrade = tradeValue - tradePayoff;
    const amountFinanced = calc.calculation.totals.grandTotal - netTrade - cashDown;
    
    if (amountFinanced <= 0 || term <= 0) return 0;
    
    const monthlyRate = (apr / 100) / 12;
    const payment = amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                    (Math.pow(1 + monthlyRate, term) - 1);
    
    return Math.round(payment);
  };
  
  const monthlyPayment = calculateMonthlyPayment();
  
  // Auto-populate from vehicle
  useEffect(() => {
    if (selectedVehicle) {
      setSalePrice(selectedVehicle.price);
      setVehicleCost(selectedVehicle.costPrice || 0);
      setMsrpCents(Math.round(selectedVehicle.price * 100));
    }
  }, [selectedVehicle]);

  // Auto-select customer from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const customerIdParam = params.get('customerId');
    if (customerIdParam) {
      setCustomerId(parseInt(customerIdParam));
      toast({
        title: "Customer Selected",
        description: "Customer pre-selected from profile",
      });
    }
  }, [location, toast]);

  // Track customer when selected and auto-populate ZIP
  useEffect(() => {
    if (customerId && selectedCustomer) {
      setTrackedCustomer(customerId.toString());
      trackInteraction('deal_desk_opened', {
        customerId: customerId.toString(),
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
      });
    }
  }, [customerId, selectedCustomer, setTrackedCustomer, trackInteraction]);

  useEffect(() => {
    if (!selectedCustomer) {
      lastPrefilledCustomerId.current = null;
      return;
    }

    if (lastPrefilledCustomerId.current !== selectedCustomer.id) {
      setCustomerZip(selectedCustomer.zipCode ?? '');
      setTitleState(selectedCustomer.state ?? null);
      setJurisdictionManuallySet(false);
      setSelectedJurisdiction(null);
      setJurisdictionData([]);

      const derivedTier = selectedCustomer.creditTier
        ?? (selectedCustomer.creditScore != null ? creditScoreToTier(selectedCustomer.creditScore) : null);

      if (derivedTier) {
        setCreditTier(derivedTier);
      }

      lastPrefilledCustomerId.current = selectedCustomer.id;
    }
  }, [selectedCustomer]);

  useEffect(() => {
    setSelectedTradeId(null);
    setTradeSelectionManuallyCleared(false);
    lastPrefilledTradeId.current = null;
    setTradeAcvCents(null);
    setTradeReconCents(null);
    setTradeAllowanceCents(null);
    setTradePayoffCents(null);
    setTradeValue(0);
    setTradePayoff(0);
    setPayoffGoodThru(null);
    setLienholderName(null);
    setJurisdictionManuallySet(false);
  }, [customerId]);

  useEffect(() => {
    if (tradeSelectionManuallyCleared) {
      return;
    }

    if (customerTrades.length === 0) {
      if (selectedTradeId !== null) {
        setSelectedTradeId(null);
      }
      lastPrefilledTradeId.current = null;
      return;
    }

    const hasSelectedTrade = customerTrades.some((trade) => trade.id === selectedTradeId);
    if (!hasSelectedTrade) {
      setSelectedTradeId(customerTrades[0].id);
    }
  }, [customerTrades, selectedTradeId, tradeSelectionManuallyCleared]);

  useEffect(() => {
    if (!selectedTradeVehicle) {
      if (tradeSelectionManuallyCleared || customerTrades.length === 0) {
        lastPrefilledTradeId.current = null;
      }
      return;
    }

    if (lastPrefilledTradeId.current === selectedTradeVehicle.id) {
      return;
    }

    const allowanceCents = moneyValueToCents(selectedTradeVehicle.actualValue ?? selectedTradeVehicle.estimatedValue);
    if (allowanceCents != null) {
      setTradeAcvCents(allowanceCents);
      setTradeAllowanceCents(allowanceCents);
      setTradeValue(allowanceCents / 100);
    }

    setTradeReconCents(null);
    setTradePayoffCents(null);

    lastPrefilledTradeId.current = selectedTradeVehicle.id;
  }, [selectedTradeVehicle, customerTrades.length, tradeSelectionManuallyCleared]);

  useEffect(() => {
    if (tradeSelectionManuallyCleared && selectedTradeId === null) {
      setTradeAcvCents(null);
      setTradeReconCents(null);
      setTradeAllowanceCents(null);
      setTradePayoffCents(null);
      setTradeValue(0);
      setTradePayoff(0);
      lastPrefilledTradeId.current = null;
    }
  }, [tradeSelectionManuallyCleared, selectedTradeId]);

  // Debounced autosave - triggers 2 seconds after user stops editing
  useEffect(() => {
    if (!selectedCustomer || !salePrice) return;
    
    setAutosaving(true);
    const timer = setTimeout(() => {
      autosaveMutation.mutate();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [
    salePrice, vehicleCost, cashDown, rebates, tradeValue, tradePayoff, term, apr, products, dealType,
    // F&I fields that should trigger autosave
    msrpCents, packCents, holdbackCents, rebatesCents, rebatesTaxable,
    tradeAcvCents, tradeReconCents, tradeAllowanceCents, tradePayoffCents, payoffGoodThru, lienholderName, titleState,
    cashDownCents, deferredDownCents, aprBps, buyRateBps, reserveBasis, reserveAmountCents, paymentFrequency,
    dealFees, enhancedProducts
  ]);

  // Lookup jurisdiction when ZIP is entered
  useEffect(() => {
    if (customerZip.length === 5) {
      fetch(`/api/jurisdictions/lookup?zip=${customerZip}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error('Failed to lookup jurisdictions');
          }
          return res.json();
        })
        .then((data) => {
          if (data.jurisdictions && data.jurisdictions.length > 0) {
            setJurisdictionData(data.jurisdictions);

            if (data.jurisdictions.length === 1 && !jurisdictionManuallySet) {
              setSelectedJurisdiction(data.jurisdictions[0]);
              toast({
                title: "Location Found",
                description: `${data.jurisdictions[0].city}, ${data.jurisdictions[0].state}`,
              });
            } else if (data.jurisdictions.length > 1 && !jurisdictionManuallySet) {
              toast({
                title: "Multiple Locations Found",
                description: `Please confirm your city/county`,
              });
            }
          }
        })
        .catch(err => {
          console.error("Error looking up ZIP:", err);
          setJurisdictionData([]);
          setSelectedJurisdiction(null);
        });
    } else {
      setJurisdictionData([]);
      setSelectedJurisdiction(null);
    }
  }, [customerZip, toast, jurisdictionManuallySet]);

  useEffect(() => {
    if (jurisdictionManuallySet || jurisdictionData.length === 0) {
      return;
    }

    const normalizedCity = selectedCustomer?.city?.trim().toLowerCase();
    const normalizedState = selectedCustomer?.state?.trim().toUpperCase();

    let match: JurisdictionOption | undefined;

    if (normalizedCity) {
      match = jurisdictionData.find((j) => j.city?.trim().toLowerCase() === normalizedCity);
    }

    if (!match && normalizedState) {
      match = jurisdictionData.find((j) => j.state.trim().toUpperCase() === normalizedState);
    }

    if (!match) {
      match = jurisdictionData[0];
    }

    if (match && (!selectedJurisdiction || selectedJurisdiction.id !== match.id)) {
      setSelectedJurisdiction(match);
    }
  }, [jurisdictionData, jurisdictionManuallySet, selectedCustomer, selectedJurisdiction]);

  useEffect(() => {
    if (!calc?.jurisdiction) {
      return;
    }

    const calcJurisdiction = calc.jurisdiction as JurisdictionOption;

    if (!jurisdictionManuallySet && (!selectedJurisdiction || selectedJurisdiction.id !== calcJurisdiction.id)) {
      setSelectedJurisdiction(calcJurisdiction);
    }

    if (calcJurisdiction.state && calcJurisdiction.state !== titleState) {
      setTitleState(calcJurisdiction.state);
    }
  }, [calc?.jurisdiction, jurisdictionManuallySet, selectedJurisdiction, titleState]);
  
  // Autosave mutation (saves draft)
  const autosaveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer) return null;
      
      const draftData: Partial<Deal> = {
        dealNumber: dealId ? undefined : `DRAFT-${Date.now()}`,
        status: 'draft',
        vehicleId: vehicleId || undefined,
        customerId: customerId || undefined,
        buyerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        dealType: dealType,
        salePrice: salePrice,
        cashDown: cashDown,
        rebates: rebates,
        tradeAllowance: tradeValue,
        tradePayoff: tradePayoff,
        salesTax: calc?.calculation.taxes.totalTax || 0,
        docFee: calc?.calculation.fees.lineItems.find(f => f.code === 'DOC')?.amount || 0,
        titleFee: calc?.calculation.fees.lineItems.find(f => f.code === 'TITLE')?.amount || 0,
        registrationFee: calc?.calculation.fees.lineItems.find(f => f.code === 'REG')?.amount || 0,
        financeBalance: calc?.calculation.totals.grandTotal || 0,
        term: term,
        rate: apr.toString(),
        creditTier: creditTier,
        // New F&I cents-based fields
        msrpCents: msrpCents,
        packCents: packCents,
        holdbackCents: holdbackCents,
        rebatesCents: rebatesCents,
        rebatesTaxable: rebatesTaxable,
        tradeAcvCents: tradeAcvCents,
        tradeReconCents: tradeReconCents,
        tradeAllowanceCents: tradeAllowanceCents,
        tradePayoffCents: tradePayoffCents,
        payoffGoodThru: payoffGoodThru,
        lienholderName: lienholderName,
        titleState: titleState,
        cashDownCents: cashDownCents,
        deferredDownCents: deferredDownCents,
        aprBps: aprBps,
        buyRateBps: buyRateBps,
        reserveBasis: reserveBasis,
        reserveAmountCents: reserveAmountCents,
        paymentFrequency: paymentFrequency,
      };
      
      if (dealId) {
        // Update existing deal
        const response = await apiRequest(`/api/deals/${dealId}`, {
          method: 'PATCH',
          body: JSON.stringify(draftData)
        });
        return response.json();
      } else {
        // Create new draft deal
        const response = await apiRequest('/api/deals', {
          method: 'POST',
          body: JSON.stringify(draftData)
        });
        const savedDeal = await response.json();
        setDealId(savedDeal.id);
        return savedDeal;
      }
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setAutosaving(false);
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: () => {
      setAutosaving(false);
    }
  });

  // Save deal mutation (final save)
  const saveDealMutation = useMutation({
    mutationFn: async () => {
      if (!calc || !selectedCustomer) {
        throw new Error('Missing required data');
      }
      
      const dealData: any = {
        dealNumber: `DEAL-${Date.now()}`,
        status: 'open',
        vehicleId: vehicleId || undefined,
        customerId: customerId || undefined,
        buyerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        dealType: dealType,
        salePrice: salePrice,
        cashDown: cashDown,
        rebates: rebates,
        tradeAllowance: tradeValue,
        tradePayoff: tradePayoff,
        salesTax: calc.calculation.taxes.totalTax,
        docFee: calc.calculation.fees.lineItems.find(f => f.code === 'DOC')?.amount || 0,
        titleFee: calc.calculation.fees.lineItems.find(f => f.code === 'TITLE')?.amount || 0,
        registrationFee: calc.calculation.fees.lineItems.find(f => f.code === 'REG')?.amount || 0,
        financeBalance: calc.calculation.totals.grandTotal - (tradeValue - tradePayoff) - cashDown,
        term: term,
        rate: apr.toString(),
        creditTier: creditTier,
        // New F&I cents-based fields
        msrpCents: msrpCents,
        packCents: packCents,
        holdbackCents: holdbackCents,
        rebatesCents: rebatesCents,
        rebatesTaxable: rebatesTaxable,
        tradeAcvCents: tradeAcvCents,
        tradeReconCents: tradeReconCents,
        tradeAllowanceCents: tradeAllowanceCents,
        tradePayoffCents: tradePayoffCents,
        payoffGoodThru: payoffGoodThru,
        lienholderName: lienholderName,
        titleState: titleState,
        cashDownCents: cashDownCents,
        deferredDownCents: deferredDownCents,
        aprBps: aprBps,
        buyRateBps: buyRateBps,
        reserveBasis: reserveBasis,
        reserveAmountCents: reserveAmountCents,
        paymentFrequency: paymentFrequency,
      };
      
      const response = await apiRequest('/api/deals', {
        method: 'POST',
        body: JSON.stringify(dealData),
      });
      const savedDeal = await response.json();
      
      // Save backend products if any (use enhancedProducts with cents-based data)
      if (enhancedProducts.length > 0 && savedDeal.id) {
        for (const product of enhancedProducts) {
          await apiRequest(`/api/deals/${savedDeal.id}/products`, {
            method: 'POST',
            body: JSON.stringify({
              productCode: product.code,
              productName: product.name,
              providerName: product.provider,
              retailCents: product.retailCents,
              costCents: product.costCents,
              termMonths: product.termMonths,
              mileageLimit: product.mileageLimit,
              isTaxable: product.isTaxable,
            }),
          });
        }
      }
      
      // Save fees if any
      if (dealFees.length > 0 && savedDeal.id) {
        for (const fee of dealFees) {
          await apiRequest(`/api/deals/${savedDeal.id}/fees`, {
            method: 'POST',
            body: JSON.stringify({
              feeCode: fee.code,
              description: fee.description,
              amountCents: fee.amountCents,
              isTaxable: fee.isTaxable,
            }),
          });
        }
      }
      
      return savedDeal;
    },
    onSuccess: (data) => {
      setDealId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${data.id}/products`] });
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${data.id}/fees`] });
      toast({
        title: 'Deal Saved',
        description: `Deal ${data.dealNumber} saved with ${enhancedProducts.length} product(s) and ${dealFees.length} fee(s).`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save deal',
        variant: 'destructive',
      });
    },
  });
  
  // Add product
  const addProduct = (category: 'warranty' | 'gap' | 'maintenance' | 'tire_wheel') => {
    // Find dealer preset for this product type
    const preset = productPresets.find((p: any) => p.productType === category);
    
    const newProduct: BackendProduct = {
      productName: preset?.productName || (
        category === 'warranty' ? 'Extended Warranty' : 
        category === 'gap' ? 'GAP Insurance' :
        category === 'maintenance' ? 'Maintenance Plan' : 'Tire & Wheel'
      ),
      retailPrice: preset?.defaultRetailPrice ? parseFloat(preset.defaultRetailPrice) : 0,
      cost: preset?.defaultCost ? parseFloat(preset.defaultCost) : 0,
      category: category,
    };
    setProducts([...products, newProduct]);
    
    // Show toast when using dealer presets
    if (preset) {
      toast({
        title: "Using Dealer Preset",
        description: `${newProduct.productName}: $${newProduct.retailPrice.toLocaleString()} retail, $${newProduct.cost.toLocaleString()} cost`,
      });
    }
  };
  
  const updateProduct = (index: number, field: 'retailPrice' | 'cost', value: number) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };
  
  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };
  
  const netTrade = tradeValue - tradePayoff;
  const frontEndProfit = salePrice - vehicleCost;
  const backEndProfit = products.reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);
  const totalProfit = frontEndProfit + backEndProfit;
  const estimatedTaxes = calc?.calculation?.taxes?.totalTax ?? 0;
  const estimatedAmountFinanced = calc?.calculation?.totals?.grandTotal != null
    ? calc.calculation.totals.grandTotal - netTrade - cashDown
    : Math.max(salePrice + aftermarketTotal + totalBackendProducts - netTrade - cashDown, 0);


  const onboardingSteps = useMemo(
    () => [
      {
        id: 'select-context',
        label: 'Select Customer & Vehicle',
        description: 'Loads stored credit tier, trades, VIN, and jurisdiction taxes.',
        complete: hasDealContext,
      },
      {
        id: 'structure-deal',
        label: 'Structure Deal Terms',
        description: 'Enter price, trade figures, aftermarket adds, and financing.',
        complete: hasDealContext && salePrice > 0,
      },
      {
        id: 'review-deliver',
        label: 'Review & Deliver Paperwork',
        description: 'Print PDFs, finalize the desk, and save the deal.',
        complete: Boolean(dealId),
      },
    ],
    [dealId, hasDealContext, salePrice]
  );
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Professional Deal Desk
            </h1>
            {dealId && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Deal ID: {dealId}
              </p>
            )}
            {/* Autosave status indicator */}
            {autosaving && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Autosaving draft...
              </p>
            )}
            {!autosaving && lastSaved && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Draft saved
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              data-testid="button-print-deal"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={() => saveDealMutation.mutate()}
              disabled={!selectedCustomer || !selectedVehicle || !calc || saveDealMutation.isPending || dealId !== null}
              data-testid="button-save-deal"
            >
              {saveDealMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : dealId ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {dealId ? 'Saved' : 'Save Deal'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Manager/Customer Mode Toggle */}
        <div className="flex items-center justify-end gap-3 mb-4">
          <Label htmlFor="manager-mode" className="text-sm font-medium flex items-center gap-2">
            {managerMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {managerMode ? 'Manager Mode' : 'Customer Mode'}
          </Label>
          <Switch
            id="manager-mode"
            checked={managerMode}
            onCheckedChange={setManagerMode}
            data-testid="switch-manager-mode"
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-lg border p-4 transition-colors ${
                step.complete
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Badge
                    variant={step.complete ? 'default' : 'outline'}
                    className={`h-8 w-8 shrink-0 rounded-full text-xs flex items-center justify-center ${
                      step.complete
                        ? 'bg-blue-600 text-white hover:bg-blue-600'
                        : 'border-gray-400 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{step.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>
                {step.complete ? (
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>


        <Tabs defaultValue="desk" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="desk" data-testid="tab-desk" className="text-xs sm:text-sm">
              <Car className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Desk Deal</span>
              <span className="sm:hidden">Desk</span>
            </TabsTrigger>

            <TabsTrigger value="fi-ledger" data-testid="tab-fi-ledger" className="text-xs sm:text-sm" disabled={!hasDealContext}>
              <DollarSign className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">F&I Ledger</span>
              <span className="sm:hidden">F&I</span>
            </TabsTrigger>

            <TabsTrigger value="backend" data-testid="tab-backend" className="text-xs sm:text-sm" disabled={!hasDealContext}>
              <Package className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Backend</span>
              <span className="sm:hidden">Products</span>
            </TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary" className="text-xs sm:text-sm" disabled={!hasDealContext}>
              <FileText className="h-4 w-4 mr-1 sm:mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="profit" data-testid="tab-profit" className="text-xs sm:text-sm" disabled={!hasDealContext}>
              <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
              Profit
            </TabsTrigger>
          </TabsList>

          {/* F&I Ledger Tab - Data-first layout */}
          <TabsContent value="fi-ledger" className="space-y-6">

            {!hasDealContext ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a customer and vehicle to review the F&I ledger.
                </CardContent>
              </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column - 8 cols on desktop */}
              <div className="lg:col-span-8 space-y-6">
                {/* Vehicle & Customer Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Vehicle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                        <SelectTrigger data-testid="select-vehicle-fi">
                          <SelectValue placeholder="Choose vehicle..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id.toString()}>
                              {v.year} {v.make} {v.model} - ${v.price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedVehicle && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">VIN: {selectedVehicle.vin}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={customerId?.toString()} onValueChange={(v) => setCustomerId(parseInt(v))}>
                        <SelectTrigger data-testid="select-customer-fi">
                          <SelectValue placeholder="Choose customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.firstName} {c.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCustomer && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">ZIP: {selectedCustomer.zipCode || 'Not provided'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {hasDealContext && (
                  <>
                    {/* Trade Section */}
                    <TradeSection
                      data={{
                        tradeAcvCents,
                        tradeReconCents,
                        tradeAllowanceCents,
                        tradePayoffCents,
                        payoffGoodThru,
                        lienholderName,
                        titleState
                      }}
                      onChange={(updates) => {
                        if (updates.tradeAcvCents !== undefined) setTradeAcvCents(updates.tradeAcvCents);
                        if (updates.tradeReconCents !== undefined) setTradeReconCents(updates.tradeReconCents);
                        if (updates.tradeAllowanceCents !== undefined) setTradeAllowanceCents(updates.tradeAllowanceCents);
                        if (updates.tradePayoffCents !== undefined) setTradePayoffCents(updates.tradePayoffCents);
                        if (updates.payoffGoodThru !== undefined) setPayoffGoodThru(updates.payoffGoodThru);
                        if (updates.lienholderName !== undefined) setLienholderName(updates.lienholderName);
                        if (updates.titleState !== undefined) setTitleState(updates.titleState);
                      }}
                      readOnly={!managerMode}
                      tradeVehicles={tradeVehicleOptions}
                      selectedTradeId={selectedTradeId}
                      onSelectTrade={(id) => {
                        setSelectedTradeId(id);
                        setTradeSelectionManuallyCleared(id === null);
                      }}
                      tradesLoading={tradesLoading}
                    />

                    {/* Fees Section */}
                    <FeesSection
                      fees={dealFees}
                      onChange={setDealFees}
                      readOnly={!managerMode}
                    />

                    {/* Finance Section */}
                    <FinanceSection
                      data={{
                        cashDownCents,
                        deferredDownCents,
                        termMonths: term,
                        aprBps,
                        buyRateBps,
                        reserveBasis,
                        reserveAmountCents,
                        paymentFrequency
                      }}
                      onChange={(updates) => {
                        if (updates.cashDownCents !== undefined) setCashDownCents(updates.cashDownCents);
                        if (updates.deferredDownCents !== undefined) setDeferredDownCents(updates.deferredDownCents);
                        if (updates.termMonths !== undefined && updates.termMonths !== null) setTerm(updates.termMonths);
                        if (updates.aprBps !== undefined) setAprBps(updates.aprBps);
                        if (updates.buyRateBps !== undefined) setBuyRateBps(updates.buyRateBps);
                        if (updates.reserveBasis !== undefined && updates.reserveBasis !== null) setReserveBasis(updates.reserveBasis);
                        if (updates.reserveAmountCents !== undefined) setReserveAmountCents(updates.reserveAmountCents);
                        if (updates.paymentFrequency !== undefined && updates.paymentFrequency !== null) setPaymentFrequency(updates.paymentFrequency);
                      }}
                      readOnly={!managerMode}
                    />

                    {/* Products Section */}
                    <ProductsSection
                      products={enhancedProducts}
                      onChange={setEnhancedProducts}
                      readOnly={!managerMode}
                      hideProfit={!managerMode}
                    />
                  </>
                )}
              </div>

              {/* Right Column - 4 cols on desktop (Sticky KPI Cards & AI Assistant) */}
              <div className="lg:col-span-4 space-y-6">
                <KPICards
                  data={{
                    salePriceCents: salePrice * 100,
                    aftermarketCents: Math.round(aftermarketTotal * 100),
                    vehicleCostCents: vehicleCost * 100,
                    packCents,
                    holdbackCents,
                    rebatesCents,
                    rebatesTaxable,
                    tradeAllowanceCents,
                    cashDownCents,
                    reserveAmountCents,
                    productsRetailCents: enhancedProducts.reduce((sum, p) => sum + (p.retailCents || 0), 0),
                    productsCostCents: enhancedProducts.reduce((sum, p) => sum + (p.costCents || 0), 0),
                    feesCents: dealFees.reduce((sum, f) => sum + (f.amountCents || 0), 0),
                    taxCents: Math.round(estimatedTaxes * 100)
                  }}
                />
                
                {/* AI Deal Assistant */}
                <AIOptimizationWrapper
                  selectedVehicle={selectedVehicle}
                  selectedCustomer={selectedCustomer}
                  salePrice={salePrice}
                  tradeValue={tradeValue}
                  tradePayoff={tradePayoff}
                  term={term}
                  apr={apr}
                  cashDown={cashDown}
                  products={products}
                  onApplySuggestion={(suggestion) => {
                    if (suggestion.type === 'pricing') {
                      setSalePrice(suggestion.value);
                      toast({
                        title: "AI Suggestion Applied",
                        description: `Sale price updated to $${suggestion.value.toLocaleString()}`
                      });
                    }
                  }}
                />

                {/* Lender Recommendations */}
                <LenderMatcher
                  creditScore={700}
                  loanAmount={estimatedAmountFinanced}
                  vehicleValue={salePrice + aftermarketTotal}
                  term={term}
                  storeId={storeId}
                  onSelectLender={(lender) => {
                    setApr(lender.rate);
                    setTerm(lender.maxTerm);
                    toast({
                      title: "Lender Selected",
                      description: `${lender.lenderName} at ${lender.rate.toFixed(2)}% APR`
                    });
                  }}
                />

                {/* Payment Scenarios */}
                <PaymentScenarios
                  vehiclePrice={salePrice + aftermarketTotal}
                  tradeValue={tradeValue}
                  tradePayoff={tradePayoff}
                  apr={apr}
                  onSelectScenario={(scenario) => {
                    setCashDown(scenario.downPayment);
                    setTerm(scenario.term);
                    toast({
                      title: "Payment Scenario Selected",
                      description: `${scenario.label}: $${scenario.monthlyPayment.toFixed(0)}/mo`
                    });
                  }}
                />
              </div>
            </div>
            )}
          </TabsContent>

          {/* Desk Tab */}
          <TabsContent value="desk" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Deal Quick Entry
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print-pdf">
                        <FileDown className="h-4 w-4 mr-1" />
                        Print Customer PDF
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveDealMutation.mutate()}
                        disabled={!selectedCustomer || !selectedVehicle || !calc || saveDealMutation.isPending}
                        data-testid="button-quick-save"
                      >
                        {saveDealMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Quick Save
                      </Button>

                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rapidly desk the deal with streamlined entry and drill-down support for trades and vehicle adds.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!hasDealContext ? (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
                      Select a customer and vehicle to unlock pricing, trade, and finance entry.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {selectedVehicle && (
                          <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <Label htmlFor="desk-quick-vin">VIN</Label>
                            <Input
                              id="desk-quick-vin"
                              value={selectedVehicle.vin}
                              readOnly
                              data-testid="input-desk-quick-vin"
                              className="bg-gray-100 dark:bg-gray-900/40"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label htmlFor="desk-sale-price">Sale Price</Label>
                          <Input
                            id="desk-sale-price"
                            type="text"
                            inputMode="decimal"
                            value={salePrice || ''}
                            onChange={(e) => setSalePrice(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-sale"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-cost">Vehicle Cost</Label>
                          <Input
                            id="desk-cost"
                            type="text"
                            inputMode="decimal"
                            value={vehicleCost || ''}
                            onChange={(e) => setVehicleCost(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-cost"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-down">Down Payment</Label>
                          <Input
                            id="desk-down"
                            type="text"
                            inputMode="decimal"
                            value={cashDown || ''}
                            onChange={(e) => setCashDown(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-down"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-rebates">Rebates</Label>
                          <Input
                            id="desk-rebates"
                            type="text"
                            inputMode="decimal"
                            value={rebates || ''}
                            onChange={(e) => setRebates(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-rebates"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-trade">Trade Allowance</Label>
                          <Input
                            id="desk-trade"
                            type="text"
                            inputMode="decimal"
                            value={tradeValue || ''}
                            onChange={(e) => setTradeValue(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-trade"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-payoff">Trade Payoff</Label>
                          <Input
                            id="desk-payoff"
                            type="text"
                            inputMode="decimal"
                            value={tradePayoff || ''}
                            onChange={(e) => setTradePayoff(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-payoff"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="desk-term">Term (months)</Label>
                          <Select value={term.toString()} onValueChange={(v) => setTerm(parseInt(v))}>
                            <SelectTrigger id="desk-term" data-testid="select-desk-term">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(financeSettings?.availableTerms || [36, 48, 60, 72, 84]).map((t: number) => (
                                <SelectItem key={t} value={t.toString()}>{t} months</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-apr">APR %</Label>
                          <Input
                            id="desk-apr"
                            type="text"
                            inputMode="decimal"
                            value={apr || ''}
                            onChange={(e) => setApr(parseDecimalInput(e.target.value))}
                            data-testid="input-desk-apr"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="desk-credit-tier">Credit Tier</Label>
                          <Select value={creditTier} onValueChange={setCreditTier}>
                            <SelectTrigger id="desk-credit-tier" data-testid="select-credit-tier">
                              <SelectValue />
                            </SelectTrigger>
                          <SelectContent>
                            {['A+', 'A', 'B', 'C', 'D'].map((tier) => (
                              <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                            ))}
                          </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Accordion type="multiple" className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <AccordionItem value="trade-justification">
                          <AccordionTrigger className="px-4">
                            Trade Justification & Allowance Worksheet
                          </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="desk-acv">Actual Cash Value</Label>
                            <Input
                              id="desk-acv"
                              type="text"
                              inputMode="decimal"
                              value={tradeAcvCents != null ? (tradeAcvCents / 100).toFixed(2) : ''}
                              onChange={(e) => setTradeAcvCents(parseCentsInput(e.target.value))}
                              placeholder="0.00"
                              data-testid="input-desk-acv"
                            />
                          </div>
                          <div>
                            <Label htmlFor="desk-recon">Recon / Reconditioning</Label>
                            <Input
                              id="desk-recon"
                              type="text"
                              inputMode="decimal"
                              value={tradeReconCents != null ? (tradeReconCents / 100).toFixed(2) : ''}
                              onChange={(e) => setTradeReconCents(parseCentsInput(e.target.value))}
                              placeholder="0.00"
                              data-testid="input-desk-recon"
                            />
                          </div>
                          <div>
                            <Label htmlFor="desk-allowance">Allowance Override</Label>
                            <Input
                              id="desk-allowance"
                              type="text"
                              inputMode="decimal"
                              value={tradeAllowanceCents != null ? (tradeAllowanceCents / 100).toFixed(2) : ''}
                              onChange={(e) => setTradeAllowanceCents(parseCentsInput(e.target.value))}
                              placeholder="Auto"
                              data-testid="input-desk-allowance"
                            />
                          </div>
                          <div>
                            <Label htmlFor="desk-trade-payoff">Lien Payoff</Label>
                            <Input
                              id="desk-trade-payoff"
                              type="text"
                              inputMode="decimal"
                              value={tradePayoffCents != null ? (tradePayoffCents / 100).toFixed(2) : ''}
                              onChange={(e) => setTradePayoffCents(parseCentsInput(e.target.value))}
                              placeholder="0.00"
                              data-testid="input-desk-trade-payoff"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Equity Position: <span className={netTrade >= 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                              ${netTrade.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </p>
                          <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print-trade">
                            <Printer className="h-4 w-4 mr-1" />
                            Print Trade Justification
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="aftermarket-adds">
                      <AccordionTrigger className="px-4">
                        Vehicle Adds & Aftermarket
                      </AccordionTrigger>
                      <AccordionContent className="px-4 space-y-4">
                        {aftermarketItems.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No aftermarket adds yet. Use the button below to capture accessories like tow hitches or tint.
                          </p>
                        ) : (
                          aftermarketItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                              <Input
                                value={item.description}
                                onChange={(e) => updateAftermarketItem(item.id, { description: e.target.value })}
                                placeholder="Accessory name"
                                data-testid={`input-aftermarket-name-${item.id}`}
                              />
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.amount || ''}
                                onChange={(e) => updateAftermarketItem(item.id, { amount: parseDecimalInput(e.target.value) })}
                                placeholder="0.00"
                                data-testid={`input-aftermarket-amount-${item.id}`}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-self-start"
                                onClick={() => removeAftermarketItem(item.id)}
                                data-testid={`button-remove-aftermarket-${item.id}`}
                              >
                                <X className="h-4 w-4 mr-1" /> Remove
                              </Button>
                            </div>
                          ))
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addAftermarketItem}
                            data-testid="button-add-aftermarket"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Aftermarket Item
                          </Button>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Total Adds: <span className="font-semibold">${aftermarketTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Customer & Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="desk-vehicle">Vehicle</Label>
                      <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                        <SelectTrigger id="desk-vehicle" data-testid="select-desk-vehicle">
                          <SelectValue placeholder="Choose vehicle..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id.toString()}>
                              {v.year} {v.make} {v.model} - ${v.price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedVehicle && (
                        <>
                          <Link href={`/inventory/${selectedVehicle.id}`}>
                            <p className="text-xs text-blue-600 dark:text-blue-400 underline mt-1">View inventory details</p>
                          </Link>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div className="space-y-1">
                              <Label htmlFor="desk-vehicle-vin" className="text-xs font-medium text-muted-foreground uppercase">VIN</Label>
                              <Input
                                id="desk-vehicle-vin"
                                value={selectedVehicle.vin}
                                readOnly
                                data-testid="input-desk-vehicle-vin"
                                className="bg-gray-100 dark:bg-gray-900/40"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="desk-vehicle-stock" className="text-xs font-medium text-muted-foreground uppercase">Stock #</Label>
                              <Input
                                id="desk-vehicle-stock"
                                value={selectedVehicle.stockNo}
                                readOnly
                                data-testid="input-desk-vehicle-stock"
                                className="bg-gray-100 dark:bg-gray-900/40"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desk-customer">Customer</Label>
                      <Select value={customerId?.toString()} onValueChange={(v) => setCustomerId(parseInt(v))}>
                        <SelectTrigger id="desk-customer" data-testid="select-desk-customer">
                          <SelectValue placeholder="Choose customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.firstName} {c.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCustomer && (
                        <Link href={`/customers/${selectedCustomer.id}`}>
                          <p className="text-xs text-green-600 dark:text-green-400 underline mt-1">View customer profile</p>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Customer & Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="desk-vehicle">Vehicle</Label>
                      <Select value={vehicleId?.toString()} onValueChange={(v) => setVehicleId(parseInt(v))}>
                        <SelectTrigger id="desk-vehicle" data-testid="select-desk-vehicle">
                          <SelectValue placeholder="Choose vehicle..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id.toString()}>
                              {v.year} {v.make} {v.model} - ${v.price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedVehicle && (
                        <Link href={`/inventory/${selectedVehicle.id}`}>
                          <p className="text-xs text-blue-600 dark:text-blue-400 underline mt-1">View inventory details</p>
                        </Link>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desk-customer">Customer</Label>
                      <Select value={customerId?.toString()} onValueChange={(v) => setCustomerId(parseInt(v))}>
                        <SelectTrigger id="desk-customer" data-testid="select-desk-customer">
                          <SelectValue placeholder="Choose customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.firstName} {c.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCustomer && (
                        <Link href={`/customers/${selectedCustomer.id}`}>
                          <p className="text-xs text-green-600 dark:text-green-400 underline mt-1">View customer profile</p>
                        </Link>
                      )}
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="desk-zip">Customer ZIP</Label>
                        <Input
                          id="desk-zip"
                          value={customerZip}
                          onChange={(e) => {
                            setCustomerZip(e.target.value);
                            setJurisdictionManuallySet(false);
                          }}
                          placeholder="ZIP"
                          maxLength={5}
                          data-testid="input-desk-zip"
                        />
                      </div>
                      {selectedJurisdiction && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 self-end">
                          {selectedJurisdiction.city}, {selectedJurisdiction.state}
                        </div>
                      )}
                    </div>

                    {jurisdictionData.length > 1 && (
                      <div>
                        <Label htmlFor="desk-jurisdiction">Jurisdiction</Label>
                        <Select
                          value={selectedJurisdiction?.id?.toString()}
                          onValueChange={(v) => {
                            const selected = jurisdictionData.find(j => j.id.toString() === v);
                            setSelectedJurisdiction(selected || null);

                            setJurisdictionManuallySet(true);
                            if (selected?.state) {
                              setTitleState(selected.state);
                            }


                          }}
                        >
                          <SelectTrigger id="desk-jurisdiction" data-testid="select-desk-jurisdiction">
                            <SelectValue placeholder="Choose location..." />
                          </SelectTrigger>
                          <SelectContent>
                            {jurisdictionData.map((j) => (
                              <SelectItem key={j.id} value={j.id.toString()}>
                                {j.display}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>


                {hasDealContext ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Deal Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Vehicle Price</span>
                        <span className="font-medium">${salePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aftermarket Adds</span>
                        <span className="font-medium">${aftermarketTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trade Difference</span>
                        <span className={netTrade >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          ${netTrade.toLocaleString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Estimated Taxes</span>
                        <span className="font-medium">
                          ${estimatedTaxes.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Financed</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ${estimatedAmountFinanced.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      {monthlyPayment > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Estimated Payment</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${monthlyPayment.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{term} months @ {apr}% APR</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Deal Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 dark:text-gray-400">
                      Confirm customer and vehicle selections to preview taxes, financing, and payment details.
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>
          </div>
          </TabsContent>
          {/* Backend Products Tab */}
          <TabsContent value="backend" className="space-y-6">
            {!hasDealContext ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a customer and vehicle to configure backend products.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Backend Products
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => addProduct('warranty')} data-testid="button-add-warranty" className="whitespace-nowrap">
                        <Plus className="h-4 w-4 mr-1" /> Warranty
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addProduct('gap')} data-testid="button-add-gap" className="whitespace-nowrap">
                        <Plus className="h-4 w-4 mr-1" /> GAP
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addProduct('maintenance')} data-testid="button-add-maintenance" className="whitespace-nowrap">
                        <Plus className="h-4 w-4 mr-1" /> Maintenance
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No backend products added yet</p>
                    </div>
                  ) : (
                    products.map((product, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{product.productName}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(index)}
                            data-testid={`button-remove-product-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label>Retail Price</Label>
                            <Input
                              type="number"
                              value={product.retailPrice || ''}
                              onChange={(e) => updateProduct(index, 'retailPrice', parseFloat(e.target.value) || 0)}
                              data-testid={`input-product-retail-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Cost</Label>
                            <Input
                              type="number"
                              value={product.cost || ''}
                              onChange={(e) => updateProduct(index, 'cost', parseFloat(e.target.value) || 0)}
                              data-testid={`input-product-cost-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Profit</Label>
                            <div className="flex items-center h-10 px-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                              <span className="font-medium text-green-600 dark:text-green-400">
                                ${(product.retailPrice - product.cost).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {!hasDealContext ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a customer and vehicle to generate the deal summary.
                </CardContent>
              </Card>
            ) : calcLoading && !calc ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calculating...</p>
                </CardContent>
              </Card>
            ) : calc ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Deal Summary</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{calc.jurisdiction.display}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Vehicle Price:</span>
                      <span className="font-medium">${salePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trade-In:</span>
                      <span className="font-medium">${netTrade.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Down Payment:</span>
                      <span className="font-medium">${cashDown.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rebates:</span>
                      <span className="font-medium">${rebates.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>Sales Tax:</span>
                      <span className="font-medium">${calc.calculation.taxes.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fees:</span>
                      <span className="font-medium">${calc.calculation.fees.nontaxFees.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${calc.calculation.totals.grandTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Amount Financed:</span>
                      <span className="text-green-600 dark:text-green-400">
                        ${(calc.calculation.totals.grandTotal - netTrade - cashDown).toLocaleString()}
                      </span>
                    </div>
                    {monthlyPayment > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${monthlyPayment.toLocaleString()}/mo
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {term} months @ {apr}% APR
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Payment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Vehicle & Backend Products */}
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Vehicle & Products</p>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Vehicle Sale Price</span>
                        <span className="font-medium">${salePrice.toLocaleString()}</span>
                      </div>
                      {aftermarketItems.length > 0 && (
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Aftermarket Adds</span>
                          <span>${aftermarketTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {products.length > 0 && (
                        <>
                          {products.map((product, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1 ml-4">
                              <span>• {product.productName}</span>
                              <span>${product.retailPrice.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span>Subtotal (with backend)</span>
                            <span>${(salePrice + aftermarketTotal + totalBackendProducts).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Taxes */}
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Taxes</p>
                      {calc.calculation.taxes.lineItems.map((tax, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>{tax.label} ({(tax.rate * 100).toFixed(2)}%)</span>
                          <span>${tax.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Total Tax</span>
                        <span>${calc.calculation.taxes.totalTax.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Fees */}
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Fees</p>
                      {calc.calculation.fees.lineItems.map((fee, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>{fee.label}</span>
                          <span>${fee.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Total Fees</span>
                        <span>${calc.calculation.fees.nontaxFees.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Finance Calculation */}
                    {monthlyPayment > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Finance Details</p>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Amount Financed</span>
                          <span>${(calc.calculation.totals.grandTotal - netTrade - cashDown).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Term</span>
                          <span>{term} months</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>APR</span>
                          <span>{apr}%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Total Finance Charge</span>
                          <span>${((monthlyPayment * term) - (calc.calculation.totals.grandTotal - netTrade - cashDown)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Total of Payments</span>
                          <span>${(monthlyPayment * term).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-blue-600 dark:text-blue-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span>Monthly Payment</span>
                          <span>${monthlyPayment.toLocaleString()}/mo</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter vehicle price and customer ZIP to see deal summary
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profit Tab */}
          <TabsContent value="profit" className="space-y-6">
            {!hasDealContext ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a customer and vehicle to analyze profit.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Front-End Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        ${frontEndProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Sale Price - Cost
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Back-End Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        ${backEndProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {products.length} product{products.length !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        ${totalProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Front + Back
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Profit Optimization */}
                <ProfitOptimizer
                  vehicleCost={vehicleCost}
                  salePrice={salePrice}
                  products={products}
                  reserveAmount={reserveAmountCents / 100}
                  onApplyOptimization={(optimizedProducts) => {
                    setProducts(optimizedProducts);
                    toast({
                      title: "Optimization Applied",
                      description: "Backend products updated with optimized pricing"
                    });
                  }}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
