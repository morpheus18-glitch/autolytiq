import { useState, type ChangeEvent } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, Search, RefreshCw, TrendingUp, TrendingDown, AlertCircle, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RateTier = "Tier 1" | "Tier 2" | "Tier 3";

interface VehicleRateDetail {
  terms: number[];
  rates: number[];
  reserves: number[];
}

interface RateSheetEntry {
  lender: string;
  tier: RateTier;
  newVehicle: VehicleRateDetail;
  usedVehicle: VehicleRateDetail;
  requirements: {
    minFico: number;
    maxLtv: number;
    maxAmount: number;
  };
  lastUpdated: string;
  effective: string;
}

interface LoanCalculatorState {
  vehiclePrice: number;
  downPayment: number;
  tradeValue: number;
  tradePayoff: number;
  fico: string;
  term: number;
}

type VehicleSelection = "new" | "used";

interface PaymentResult {
  lender: string;
  tier: RateTier;
  rate: number;
  payment: number;
  reservePercent: number;
  reserveAmount: number;
  highlight: "best" | "competitive" | "standard";
}

const DEFAULT_LOAN_FORM: LoanCalculatorState = {
  vehiclePrice: 35000,
  downPayment: 5000,
  tradeValue: 15000,
  tradePayoff: 12000,
  fico: "700-749",
  term: 60,
};

const getEligibleTiers = (ficoRange: string): RateTier[] => {
  switch (ficoRange) {
    case "750+":
      return ["Tier 1"];
    case "700-749":
      return ["Tier 1"];
    case "650-699":
      return ["Tier 2"];
    case "600-649":
      return ["Tier 2", "Tier 3"];
    default:
      return ["Tier 3"];
  }
};

const calculateFinancedAmount = (loan: LoanCalculatorState) => {
  const financed = loan.vehiclePrice - loan.downPayment - loan.tradeValue + loan.tradePayoff;
  return Math.max(financed, 0);
};

const calculateMonthlyPayment = (principal: number, apr: number, termMonths: number) => {
  if (termMonths <= 0) {
    return 0;
  }
  const monthlyRate = apr / 1200;
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const buildPaymentComparison = (
  rateTable: RateSheetEntry[],
  loan: LoanCalculatorState,
  vehicleType: VehicleSelection
): PaymentResult[] => {
  const financedAmount = calculateFinancedAmount(loan);
  if (financedAmount <= 0) {
    return [];
  }

  const vehicleKey: "newVehicle" | "usedVehicle" = vehicleType === "new" ? "newVehicle" : "usedVehicle";
  const eligibleTiers = getEligibleTiers(loan.fico);
  const comparisonPool = rateTable.filter((entry) => eligibleTiers.includes(entry.tier));
  const source = comparisonPool.length ? comparisonPool : rateTable;

  return source
    .map((entry) => {
      const dataset = entry[vehicleKey];
      const termIndex = dataset.terms.findIndex((term) => term === loan.term);
      if (termIndex === -1) {
        return null;
      }

      const rate = dataset.rates[termIndex];
      const reservePercent = dataset.reserves[termIndex];
      const payment = calculateMonthlyPayment(financedAmount, rate, loan.term);
      const reserveAmount = financedAmount * (reservePercent / 100);

      return {
        lender: entry.lender,
        tier: entry.tier,
        rate,
        payment,
        reservePercent,
        reserveAmount,
        highlight: "standard" as const,
      };
    })
    .filter((entry): entry is PaymentResult => entry !== null)
    .sort((a, b) => a.payment - b.payment)
    .map((entry, index) => ({
      ...entry,
      highlight: index === 0 ? "best" : index === 1 ? "competitive" : "standard",
    }))
    .slice(0, 4);
};

const rateData: RateSheetEntry[] = [
  {
    lender: "Honda Finance",
    tier: "Tier 1",
    newVehicle: {
      terms: [36, 48, 60, 72, 84],
      rates: [3.9, 4.1, 4.3, 4.9, 5.4],
      reserves: [1.25, 1.35, 1.45, 1.65, 1.85],
    },
    usedVehicle: {
      terms: [36, 48, 60, 72, 84],
      rates: [4.4, 4.6, 4.8, 5.4, 5.9],
      reserves: [1.5, 1.6, 1.7, 1.9, 2.1],
    },
    requirements: {
      minFico: 620,
      maxLtv: 125,
      maxAmount: 150000,
    },
    lastUpdated: "2024-01-22",
    effective: "2024-01-20",
  },
  {
    lender: "Bank of America",
    tier: "Tier 1",
    newVehicle: {
      terms: [36, 48, 60, 72],
      rates: [4.2, 4.5, 4.9, 5.4],
      reserves: [1.4, 1.5, 1.7, 1.85],
    },
    usedVehicle: {
      terms: [36, 48, 60, 72],
      rates: [4.9, 5.2, 5.6, 6.1],
      reserves: [1.8, 1.9, 2.0, 2.2],
    },
    requirements: {
      minFico: 650,
      maxLtv: 120,
      maxAmount: 200000,
    },
    lastUpdated: "2024-01-21",
    effective: "2024-01-19",
  },
  {
    lender: "Wells Fargo Dealer Services",
    tier: "Tier 2",
    newVehicle: {
      terms: [36, 48, 60, 72, 75],
      rates: [5.9, 6.2, 6.8, 7.4, 7.9],
      reserves: [2.0, 2.1, 2.25, 2.4, 2.6],
    },
    usedVehicle: {
      terms: [36, 48, 60, 72, 75],
      rates: [6.4, 6.9, 7.5, 8.1, 8.6],
      reserves: [2.3, 2.4, 2.6, 2.8, 3.0],
    },
    requirements: {
      minFico: 580,
      maxLtv: 115,
      maxAmount: 125000,
    },
    lastUpdated: "2024-01-20",
    effective: "2024-01-18",
  },
  {
    lender: "Capital One Auto Finance",
    tier: "Tier 2",
    newVehicle: {
      terms: [36, 48, 60, 72],
      rates: [6.9, 7.4, 7.9, 8.4],
      reserves: [2.4, 2.6, 2.75, 2.9],
    },
    usedVehicle: {
      terms: [36, 48, 60, 72],
      rates: [7.8, 8.3, 8.9, 9.4],
      reserves: [2.8, 3.0, 3.2, 3.4],
    },
    requirements: {
      minFico: 540,
      maxLtv: 110,
      maxAmount: 100000,
    },
    lastUpdated: "2024-01-19",
    effective: "2024-01-17",
  },
];

const marketRates = {
  fedRate: 5.25,
  primeRate: 8.25,
  autoLoanAvg: 6.73,
  trend: "stable",
  lastUpdate: "2024-01-22"
};

export default function RateSheets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<RateTier | "all">("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleSelection>("new");
  const [rates, setRates] = useState<RateSheetEntry[]>(rateData);
  const [previousRates, setPreviousRates] = useState<RateSheetEntry[]>(rateData);
  const [marketSnapshot, setMarketSnapshot] = useState(marketRates);
  const [loanForm, setLoanForm] = useState<LoanCalculatorState>(() => ({ ...DEFAULT_LOAN_FORM }));
  const [paymentResults, setPaymentResults] = useState<PaymentResult[]>(() =>
    buildPaymentComparison(rateData, DEFAULT_LOAN_FORM, "new")
  );
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string>(new Date().toISOString());

  const filteredRates = rates.filter(rate => {
    const matchesSearch = rate.lender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === "all" || rate.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits,
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1':
        return "bg-green-100 text-green-800";
      case 'Tier 2':
        return "bg-blue-100 text-blue-800";
      case 'Tier 3':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRateChange = (
    lenderName: string,
    termIndex: number,
    vehicleType: "newVehicle" | "usedVehicle"
  ) => {
    const current = rates.find((rate) => rate.lender === lenderName);
    const previous = previousRates.find((rate) => rate.lender === lenderName);
    if (!current || !previous) {
      return 0;
    }
    const currentRate = current[vehicleType].rates[termIndex];
    const previousRate = previous[vehicleType].rates[termIndex];
    return Number((currentRate - previousRate).toFixed(2));
  };

  const handleLoanFieldChange = <K extends keyof LoanCalculatorState>(
    key: K,
    value: LoanCalculatorState[K]
  ) => {
    setLoanForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  type NumericLoanField = "vehiclePrice" | "downPayment" | "tradeValue" | "tradePayoff";

  const handleNumericInput = (key: NumericLoanField) => (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = Number(event.target.value);
    const sanitized = Number.isNaN(numericValue) ? 0 : Math.max(numericValue, 0);
    handleLoanFieldChange(key, sanitized as LoanCalculatorState[NumericLoanField]);
  };

  const handleCalculate = () => {
    const nextResults = buildPaymentComparison(rates, loanForm, selectedVehicleType);
    setPaymentResults(nextResults);
    setLastCalculatedAt(new Date().toISOString());
  };

  const handleRefresh = () => {
    setRates((prevRates) => {
      setPreviousRates(prevRates);
      const updatedRates = prevRates.map((rate) => {
        const adjustRates = (values: number[]) =>
          values.map((value) => {
            const delta = (Math.random() - 0.5) * 0.4;
            return Number(Math.max(value + delta, 0).toFixed(2));
          });

        const adjustReserves = (values: number[]) =>
          values.map((value) => {
            const delta = (Math.random() - 0.5) * 0.2;
            return Number(Math.max(value + delta, 0).toFixed(2));
          });

        const effectiveDate = new Date();
        effectiveDate.setDate(effectiveDate.getDate() + 2);

        return {
          ...rate,
          newVehicle: {
            terms: [...rate.newVehicle.terms],
            rates: adjustRates(rate.newVehicle.rates),
            reserves: adjustReserves(rate.newVehicle.reserves)
          },
          usedVehicle: {
            terms: [...rate.usedVehicle.terms],
            rates: adjustRates(rate.usedVehicle.rates),
            reserves: adjustReserves(rate.usedVehicle.reserves)
          },
          lastUpdated: new Date().toISOString().slice(0, 10),
          effective: effectiveDate.toISOString().slice(0, 10)
        };
      });

      if (paymentResults.length) {
        const recalculated = buildPaymentComparison(updatedRates, loanForm, selectedVehicleType);
        setPaymentResults(recalculated);
        setLastCalculatedAt(new Date().toISOString());
      }

      return updatedRates;
    });

    setMarketSnapshot((prev) => {
      const adjust = (value: number, scale: number) =>
        Number(Math.max(value + (Math.random() - 0.5) * scale, 0).toFixed(2));
      return {
        fedRate: adjust(prev.fedRate, 0.1),
        primeRate: adjust(prev.primeRate, 0.15),
        autoLoanAvg: adjust(prev.autoLoanAvg, 0.2),
        trend:
          Math.random() > 0.6 ? "rising" : Math.random() > 0.6 ? "declining" : "stable",
        lastUpdate: new Date().toISOString().slice(0, 10)
      };
    });
  };

  const financedAmount = calculateFinancedAmount(loanForm);

  const highlightStyles: Record<PaymentResult["highlight"], { label: string; badgeClass: string }> = {
    best: { label: "Best Payment", badgeClass: "bg-green-100 text-green-800" },
    competitive: { label: "Competitive Option", badgeClass: "bg-blue-100 text-blue-800" },
    standard: { label: "Additional Option", badgeClass: "bg-gray-100 text-gray-800" },
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rate Sheets</h1>
          <p className="text-gray-600 mt-1">Current lending rates and terms from all finance partners</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline" className="flex items-center space-x-2">
            <Link href="/finance/rates/import">
              <span className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Import Rates</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center space-x-2">
            <Link href="/finance/rates/export">
              <span className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </span>
            </Link>
          </Button>
          <Button className="flex items-center space-x-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh All</span>
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Market Rate Overview</span>
          </CardTitle>
          <CardDescription>Current market conditions and benchmark rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Federal Rate</p>
              <p className="text-2xl font-bold text-blue-700">{formatPercent(marketSnapshot.fedRate)}</p>
              <p className="text-xs text-blue-600">Base rate</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Prime Rate</p>
              <p className="text-2xl font-bold text-green-700">{formatPercent(marketSnapshot.primeRate)}</p>
              <p className="text-xs text-green-600">Prime lending</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Auto Loan Avg</p>
              <p className="text-2xl font-bold text-purple-700">{formatPercent(marketSnapshot.autoLoanAvg)}</p>
              <p className="text-xs text-purple-600">National average</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Market Trend</p>
              <p className="text-2xl font-bold text-orange-700 capitalize">{marketSnapshot.trend}</p>
              <p className="text-xs text-orange-600">Last update {marketSnapshot.lastUpdate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Rates</TabsTrigger>
          <TabsTrigger value="comparison">Rate Comparison</TabsTrigger>
          <TabsTrigger value="calculator">Rate Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by lender name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as RateTier | "all")}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Credit Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                    <SelectItem value="Tier 3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedVehicleType}
                  onValueChange={(value) => setSelectedVehicleType(value as VehicleSelection)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Vehicle</SelectItem>
                    <SelectItem value="used">Used Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rate Tables */}
          <div className="space-y-6">
            {filteredRates.map((lender) => (
              <Card key={lender.lender}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{lender.lender}</span>
                        <Badge className={getTierColor(lender.tier)}>
                          {lender.tier}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Last updated: {lender.lastUpdated} | Effective: {lender.effective}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Requirements</p>
                      <p className="text-xs">Min FICO: {lender.requirements.minFico}</p>
                      <p className="text-xs">Max LTV: {lender.requirements.maxLtv}%</p>
                      <p className="text-xs">Max Amount: {formatCurrency(lender.requirements.maxAmount)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* New Vehicle Rates */}
                    {selectedVehicleType === "new" && (
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700">New Vehicle Rates</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Term</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                              <TableHead className="text-right">Reserve</TableHead>
                              <TableHead className="text-right">Change</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lender.newVehicle.terms.map((term, index) => {
                              const change = getRateChange(lender.lender, index, "newVehicle");
                              return (
                                <TableRow key={term}>
                                  <TableCell className="font-medium">{term} months</TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {formatPercent(lender.newVehicle.rates[index])}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600 font-medium">
                                    {formatPercent(lender.newVehicle.reserves[index])}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className={`flex items-center justify-end space-x-1 ${
                                      change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                                       change < 0 ? <TrendingDown className="h-3 w-3" /> : 
                                       <span className="w-3 h-3">-</span>}
                                      <span className="text-xs">
                                        {change !== 0 ? formatPercent(Math.abs(change)) : '0%'}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Used Vehicle Rates */}
                    {selectedVehicleType === "used" && (
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-700">Used Vehicle Rates</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Term</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                              <TableHead className="text-right">Reserve</TableHead>
                              <TableHead className="text-right">Change</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lender.usedVehicle.terms.map((term, index) => {
                              const change = getRateChange(lender.lender, index, "usedVehicle");
                              return (
                                <TableRow key={term}>
                                  <TableCell className="font-medium">{term} months</TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {formatPercent(lender.usedVehicle.rates[index])}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600 font-medium">
                                    {formatPercent(lender.usedVehicle.reserves[index])}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className={`flex items-center justify-end space-x-1 ${
                                      change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                                       change < 0 ? <TrendingDown className="h-3 w-3" /> : 
                                       <span className="w-3 h-3">-</span>}
                                      <span className="text-xs">
                                        {change !== 0 ? formatPercent(Math.abs(change)) : '0%'}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Comparison Matrix</CardTitle>
              <CardDescription>
                Compare rates across all lenders for common terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">60-Month New Vehicle Rates</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lender</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Reserve</TableHead>
                        <TableHead className="text-right">Min FICO</TableHead>
                        <TableHead className="text-right">Max Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateData
                        .sort((a, b) => {
                          const aRate = a.newVehicle.rates[a.newVehicle.terms.indexOf(60)] || 999;
                          const bRate = b.newVehicle.rates[b.newVehicle.terms.indexOf(60)] || 999;
                          return aRate - bRate;
                        })
                        .map((lender) => {
                          const termIndex = lender.newVehicle.terms.indexOf(60);
                          if (termIndex === -1) return null;
                          
                          return (
                            <TableRow key={lender.lender}>
                              <TableCell className="font-medium">{lender.lender}</TableCell>
                              <TableCell>
                                <Badge className={getTierColor(lender.tier)}>
                                  {lender.tier}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatPercent(lender.newVehicle.rates[termIndex])}
                              </TableCell>
                              <TableCell className="text-right text-green-600 font-medium">
                                {formatPercent(lender.newVehicle.reserves[termIndex])}
                              </TableCell>
                              <TableCell className="text-right">
                                {lender.requirements.minFico}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(lender.requirements.maxAmount)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                        .filter(Boolean)}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Calculator</CardTitle>
              <CardDescription>
                Calculate payments and compare options across lenders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Loan Parameters</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Vehicle Price</label>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        value={loanForm.vehiclePrice}
                        onChange={handleNumericInput("vehiclePrice")}
                        placeholder="$35,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Down Payment</label>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        value={loanForm.downPayment}
                        onChange={handleNumericInput("downPayment")}
                        placeholder="$5,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Trade Value</label>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        value={loanForm.tradeValue}
                        onChange={handleNumericInput("tradeValue")}
                        placeholder="$15,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Trade Payoff</label>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        value={loanForm.tradePayoff}
                        onChange={handleNumericInput("tradePayoff")}
                        placeholder="$12,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Customer FICO</label>
                      <Select
                        value={loanForm.fico}
                        onValueChange={(value) => handleLoanFieldChange("fico", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select FICO Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="750+">750+ (Excellent)</SelectItem>
                          <SelectItem value="700-749">700-749 (Good)</SelectItem>
                          <SelectItem value="650-699">650-699 (Fair)</SelectItem>
                          <SelectItem value="600-649">600-649 (Poor)</SelectItem>
                          <SelectItem value="<600">&lt;600 (Bad)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Term</label>
                      <Select
                        value={loanForm.term.toString()}
                        onValueChange={(value) => handleLoanFieldChange("term", Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                          <SelectItem value="72">72 months</SelectItem>
                          <SelectItem value="84">84 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="button" className="w-full" onClick={handleCalculate}>
                    Calculate Payments
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Payment Comparison</h4>
                  <p className="text-sm text-gray-600">
                    Amount financed {formatCurrency(financedAmount)} over {loanForm.term} months.
                  </p>
                  <div className="space-y-3">
                    {paymentResults.length === 0 && (
                      <div className="p-4 border border-dashed rounded-lg text-sm text-gray-600">
                        Enter deal details and select a term to generate live lender comparisons.
                      </div>
                    )}
                    {paymentResults.map((result) => {
                      const highlight = highlightStyles[result.highlight];
                      return (
                        <div
                          key={`${result.lender}-${result.tier}-${loanForm.term}-${selectedVehicleType}`}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{result.lender}</span>
                              <Badge variant="outline" className="capitalize">
                                {result.tier}
                              </Badge>
                            </div>
                            <Badge className={highlight.badgeClass}>{highlight.label}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Rate</p>
                              <p className="font-semibold">{formatPercent(result.rate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payment</p>
                              <p className="font-semibold">{formatCurrency(result.payment, 2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Reserve</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(result.reserveAmount, 2)} ({result.reservePercent.toFixed(2)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Last calculated {new Date(lastCalculatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}