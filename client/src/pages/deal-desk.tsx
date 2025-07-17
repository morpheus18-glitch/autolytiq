import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, Vehicle } from "@shared/schema";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Car, 
  User, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Percent,
  PiggyBank,
  Receipt,
  Shield,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Printer,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Settings,
  Filter,
  SortAsc,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  Bookmark,
  Share,
  ExternalLink,
  Link,
  Archive,
  Trash,
  AlertCircle,
  Info,
  HelpCircle,
  Home,
  Building,
  MapPin as LocationIcon,
  Globe,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Monitor,
  Laptop
} from "lucide-react";



// Tax rates by state (simplified for demo)
const TAX_RATES_BY_STATE: Record<string, number> = {
  'CA': 0.0725, 'NY': 0.08, 'TX': 0.0625, 'FL': 0.06, 'IL': 0.0625,
  'PA': 0.06, 'OH': 0.0575, 'GA': 0.04, 'NC': 0.0475, 'MI': 0.06,
  'NJ': 0.06625, 'VA': 0.0435, 'WA': 0.065, 'AZ': 0.056, 'MA': 0.0625,
  'TN': 0.07, 'IN': 0.07, 'MO': 0.0423, 'MD': 0.06, 'WI': 0.05,
  'CO': 0.0290, 'MN': 0.06875, 'SC': 0.05, 'AL': 0.04, 'LA': 0.0445,
  'KY': 0.06, 'OR': 0.0, 'OK': 0.0450, 'CT': 0.0635, 'IA': 0.06,
  'MS': 0.07, 'AR': 0.065, 'UT': 0.0485, 'KS': 0.0650, 'NV': 0.0685,
  'NM': 0.05125, 'WV': 0.06, 'NE': 0.055, 'ID': 0.06, 'HI': 0.04,
  'NH': 0.0, 'ME': 0.055, 'MT': 0.0, 'RI': 0.07, 'DE': 0.0,
  'SD': 0.045, 'ND': 0.05, 'AK': 0.0, 'VT': 0.06, 'WY': 0.04
};

// State registration fees (simplified for demo)
const STATE_FEES: Record<string, number> = {
  'CA': 75, 'NY': 45, 'TX': 33, 'FL': 35, 'IL': 101,
  'PA': 38, 'OH': 31, 'GA': 20, 'NC': 36, 'MI': 15,
  'NJ': 60, 'VA': 40, 'WA': 30, 'AZ': 4, 'MA': 75,
  'TN': 29, 'IN': 25, 'MO': 8.50, 'MD': 135, 'WI': 75,
  'CO': 7.20, 'MN': 10, 'SC': 40, 'AL': 23, 'LA': 68.50,
  'KY': 21, 'OR': 77, 'OK': 96, 'CT': 80, 'IA': 25,
  'MS': 14, 'AR': 10, 'UT': 150, 'KS': 10, 'NV': 25,
  'NM': 27, 'WV': 30, 'NE': 15, 'ID': 48, 'HI': 5,
  'NH': 18, 'ME': 35, 'MT': 217, 'RI': 32, 'DE': 35,
  'SD': 5, 'ND': 5, 'AK': 15, 'VT': 76, 'WY': 30
};

interface DealVehicle {
  id: number;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  mileage: number;
  color: string;
  category: string;
  status: string;
  cost: number;
  bookValue: number;
  marketValue: number;
  daysOnLot: number;
  images: string[];
  features: string[];
  condition: string;
  transmission: string;
  fuelType: string;
  bodyStyle: string;
  drivetrain: string;
  engine: string;
  exteriorColor: string;
  interiorColor: string;
  certified: boolean;
  warranty: string;
  carfaxAvailable: boolean;
  serviceRecords: boolean;
  previousOwners: number;
  accidents: number;
  location: string;
  lotPosition: string;
  salesPerson: string;
  acquisitionDate: Date;
  reconditioning: number;
  holdback: number;
  incentives: number;
  floorPlan: number;
  packAmount: number;
  competitorPricing: {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    marketPosition: string;
  };
}

interface DealCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
  dateOfBirth: Date;
  driversLicense: string;
  employmentStatus: string;
  employer: string;
  income: number;
  housingStatus: string;
  monthlyPayment: number;
  creditScore: number;
  coApplicant?: {
    name: string;
    email: string;
    phone: string;
    ssn: string;
    dateOfBirth: Date;
    driversLicense: string;
    employmentStatus: string;
    employer: string;
    income: number;
    creditScore: number;
  };
  tradeVehicle?: {
    year: number;
    make: string;
    model: string;
    trim: string;
    vin: string;
    mileage: number;
    condition: string;
    estimatedValue: number;
    payoffAmount: number;
    lienHolder: string;
    equity: number;
    actualCashValue: number;
    roughTradeValue: number;
    cleanTradeValue: number;
    retailValue: number;
    images: string[];
    damages: string[];
    features: string[];
    serviceRecords: boolean;
    accidents: number;
    previousOwners: number;
    carfaxAvailable: boolean;
    keyCount: number;
    tireCondition: string;
    brakeCondition: string;
    needsService: boolean;
    reconditioningNeeded: number;
  };
  preferences: {
    paymentRange: { min: number; max: number };
    termPreference: number;
    downPaymentCapacity: number;
    tradeInExpected: boolean;
    financingPreference: 'finance' | 'lease' | 'cash';
    urgency: 'low' | 'medium' | 'high';
    contactMethod: 'phone' | 'email' | 'text';
    bestTimeToContact: string;
    specificNeeds: string[];
  };
  creditApplication: {
    submitted: boolean;
    approved: boolean;
    tier: 'super_prime' | 'prime' | 'near_prime' | 'subprime' | 'deep_subprime';
    approvedAmount: number;
    approvedRate: number;
    approvedTerm: number;
    bankName: string;
    conditions: string[];
    expirationDate: Date;
  };
  history: {
    previousPurchases: {
      date: Date;
      vehicle: string;
      amount: number;
      satisfaction: number;
    }[];
    serviceHistory: {
      date: Date;
      service: string;
      amount: number;
      satisfaction: number;
    }[];
    interactions: {
      date: Date;
      type: 'call' | 'email' | 'visit' | 'text';
      notes: string;
      outcome: string;
    }[];
  };
}

interface DealStructure {
  id?: number;
  dealNumber: string;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'funded' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  assignedTo: string;
  customer: DealCustomer;
  vehicles: DealVehicle[];
  primaryVehicle: number; // Index of primary vehicle
  
  // Pricing Structure
  pricing: {
    totalVehiclePrice: number;
    totalTradeValue: number;
    netTradeValue: number;
    cashDown: number;
    netCashDown: number;
    amountToFinance: number;
    salesTax: number;
    stateFees: number;
    documentationFee: number;
    processingFee: number;
    otherFees: { name: string; amount: number }[];
    totalAmount: number;
    netAmount: number;
    grossProfit: number;
    netProfit: number;
    frontEndGross: number;
    backEndGross: number;
    totalGross: number;
    holdback: number;
    incentives: number;
    spiff: number;
    commissionRate: number;
    commissionAmount: number;
    managerBonus: number;
    packAmount: number;
    floorPlanCost: number;
    carryingCost: number;
    reconditioningCost: number;
    advertisingCost: number;
    otherCosts: { name: string; amount: number }[];
  };
  
  // Financing Terms
  financing: {
    type: 'retail' | 'lease' | 'cash';
    lender: string;
    program: string;
    term: number;
    apr: number;
    payment: number;
    totalInterest: number;
    totalOfPayments: number;
    advancePayments: number;
    deferredPayments: number;
    balloonPayment: number;
    buyRate: number;
    sellRate: number;
    rateMarkup: number;
    reserveAmount: number;
    participationRate: number;
    residualValue: number;
    moneyFactor: number;
    acquisitionFee: number;
    dispositionFee: number;
    excessMileageCharge: number;
    mileageAllowance: number;
    wearAndTearCoverage: boolean;
    gapCoverage: boolean;
    multipleSecurityDeposits: number;
    paymentProtection: boolean;
    skipPaymentOption: boolean;
    downPaymentAssistance: number;
    rebateAssignment: boolean;
    coSignerRequired: boolean;
    incomeVerification: boolean;
    employmentVerification: boolean;
    proofOfResidence: boolean;
    bankReferences: boolean;
    personalReferences: boolean;
    creditLifeInsurance: boolean;
    creditDisabilityInsurance: boolean;
    paymentMethod: 'auto_pay' | 'manual' | 'payroll_deduction';
    paymentFrequency: 'monthly' | 'bi_weekly' | 'weekly';
    firstPaymentDate: Date;
    maturityDate: Date;
    paymentDueDate: number;
    gracePeriod: number;
    lateFee: number;
    returnedCheckFee: number;
    prepaymentPenalty: boolean;
    refinanceProtection: boolean;
    defaultRate: number;
    repossessionFee: number;
    collectionFee: number;
  };
  
  // Product & Services (F&I)
  products: {
    extendedWarranty: {
      selected: boolean;
      provider: string;
      term: number;
      mileage: number;
      coverage: string;
      deductible: number;
      cost: number;
      markup: number;
      commission: number;
    };
    gapInsurance: {
      selected: boolean;
      provider: string;
      term: number;
      coverage: number;
      cost: number;
      markup: number;
      commission: number;
    };
    paintProtection: {
      selected: boolean;
      provider: string;
      warranty: string;
      cost: number;
      markup: number;
      commission: number;
    };
    fabricProtection: {
      selected: boolean;
      provider: string;
      warranty: string;
      cost: number;
      markup: number;
      commission: number;
    };
    maintenancePackage: {
      selected: boolean;
      provider: string;
      term: number;
      services: string[];
      cost: number;
      markup: number;
      commission: number;
    };
    tireCare: {
      selected: boolean;
      provider: string;
      term: number;
      coverage: string;
      cost: number;
      markup: number;
      commission: number;
    };
    etching: {
      selected: boolean;
      provider: string;
      warranty: string;
      cost: number;
      markup: number;
      commission: number;
    };
    alarmSystem: {
      selected: boolean;
      provider: string;
      features: string[];
      cost: number;
      markup: number;
      commission: number;
    };
    customAccessories: {
      selected: boolean;
      items: { name: string; cost: number; markup: number; commission: number }[];
      totalCost: number;
      totalMarkup: number;
      totalCommission: number;
    };
  };
  
  // Payment Structure
  payments: {
    structures: {
      id: number;
      name: string;
      term: number;
      apr: number;
      payment: number;
      totalInterest: number;
      totalOfPayments: number;
      selected: boolean;
      bankName: string;
      program: string;
      tier: string;
      approved: boolean;
      conditions: string[];
      expirationDate: Date;
    }[];
    selectedStructure: number;
    customStructure: {
      enabled: boolean;
      term: number;
      apr: number;
      payment: number;
      bankName: string;
      program: string;
      conditions: string[];
    };
    paymentSpread: {
      show: boolean;
      options: {
        term: number;
        apr: number;
        payment: number;
        totalInterest: number;
        bankName: string;
        program: string;
        tier: string;
        approved: boolean;
        selected: boolean;
      }[];
    };
    calculatorHistory: {
      timestamp: Date;
      term: number;
      apr: number;
      payment: number;
      totalInterest: number;
      notes: string;
    }[];
  };
  
  // Deal Progress
  workflow: {
    currentStep: number;
    steps: {
      id: number;
      name: string;
      status: 'pending' | 'active' | 'completed' | 'skipped';
      assignedTo: string;
      dueDate: Date;
      completedDate?: Date;
      notes: string;
      documents: string[];
      requirements: string[];
    }[];
    milestones: {
      creditApplication: { completed: boolean; date?: Date };
      vehicleSelection: { completed: boolean; date?: Date };
      tradeAppraisal: { completed: boolean; date?: Date };
      financingApproval: { completed: boolean; date?: Date };
      insuranceVerification: { completed: boolean; date?: Date };
      finalNegotiation: { completed: boolean; date?: Date };
      contractSigning: { completed: boolean; date?: Date };
      fundingSubmission: { completed: boolean; date?: Date };
      vehicleDelivery: { completed: boolean; date?: Date };
      dealFunding: { completed: boolean; date?: Date };
      dealCompletion: { completed: boolean; date?: Date };
    };
    alerts: {
      id: number;
      type: 'warning' | 'error' | 'info' | 'success';
      message: string;
      timestamp: Date;
      acknowledged: boolean;
      dismissible: boolean;
    }[];
    timeline: {
      timestamp: Date;
      event: string;
      description: string;
      user: string;
      type: 'system' | 'user' | 'automatic';
    }[];
  };
  
  // Compliance & Documentation
  compliance: {
    requiredDocuments: {
      creditApplication: { required: boolean; received: boolean; date?: Date };
      driversLicense: { required: boolean; received: boolean; date?: Date };
      proofOfIncome: { required: boolean; received: boolean; date?: Date };
      proofOfResidence: { required: boolean; received: boolean; date?: Date };
      socialSecurityCard: { required: boolean; received: boolean; date?: Date };
      bankStatements: { required: boolean; received: boolean; date?: Date };
      proofOfInsurance: { required: boolean; received: boolean; date?: Date };
      employmentVerification: { required: boolean; received: boolean; date?: Date };
      personalReferences: { required: boolean; received: boolean; date?: Date };
      tradeTitle: { required: boolean; received: boolean; date?: Date };
      tradeRegistration: { required: boolean; received: boolean; date?: Date };
      tradeKeys: { required: boolean; received: boolean; date?: Date };
      payoffAuthorization: { required: boolean; received: boolean; date?: Date };
      coSignerDocuments: { required: boolean; received: boolean; date?: Date };
      powerOfAttorney: { required: boolean; received: boolean; date?: Date };
      buyersOrder: { required: boolean; received: boolean; date?: Date };
      purchaseAgreement: { required: boolean; received: boolean; date?: Date };
      financeContract: { required: boolean; received: boolean; date?: Date };
      odometer: { required: boolean; received: boolean; date?: Date };
      title: { required: boolean; received: boolean; date?: Date };
      registration: { required: boolean; received: boolean; date?: Date };
      emissions: { required: boolean; received: boolean; date?: Date };
      inspection: { required: boolean; received: boolean; date?: Date };
      warranty: { required: boolean; received: boolean; date?: Date };
      tradeLienRelease: { required: boolean; received: boolean; date?: Date };
      newLienholderInfo: { required: boolean; received: boolean; date?: Date };
      payoffQuote: { required: boolean; received: boolean; date?: Date };
    };
    signatures: {
      buyersOrder: { required: boolean; signed: boolean; date?: Date };
      purchaseAgreement: { required: boolean; signed: boolean; date?: Date };
      financeContract: { required: boolean; signed: boolean; date?: Date };
      odometer: { required: boolean; signed: boolean; date?: Date };
      warranty: { required: boolean; signed: boolean; date?: Date };
      deliveryReceipt: { required: boolean; signed: boolean; date?: Date };
      keyReceipt: { required: boolean; signed: boolean; date?: Date };
      fuelReceipt: { required: boolean; signed: boolean; date?: Date };
      tradeTitle: { required: boolean; signed: boolean; date?: Date };
      payoffAuthorization: { required: boolean; signed: boolean; date?: Date };
      insuranceWaiver: { required: boolean; signed: boolean; date?: Date };
      dataPrivacy: { required: boolean; signed: boolean; date?: Date };
      creditDisclosure: { required: boolean; signed: boolean; date?: Date };
      truthInLending: { required: boolean; signed: boolean; date?: Date };
      rightToCancel: { required: boolean; signed: boolean; date?: Date };
      adverseAction: { required: boolean; signed: boolean; date?: Date };
    };
    verifications: {
      creditVerification: { required: boolean; completed: boolean; date?: Date };
      incomeVerification: { required: boolean; completed: boolean; date?: Date };
      employmentVerification: { required: boolean; completed: boolean; date?: Date };
      residenceVerification: { required: boolean; completed: boolean; date?: Date };
      bankVerification: { required: boolean; completed: boolean; date?: Date };
      insuranceVerification: { required: boolean; completed: boolean; date?: Date };
      identityVerification: { required: boolean; completed: boolean; date?: Date };
      referenceVerification: { required: boolean; completed: boolean; date?: Date };
      tradeVerification: { required: boolean; completed: boolean; date?: Date };
      titleVerification: { required: boolean; completed: boolean; date?: Date };
      lienholder: { required: boolean; completed: boolean; date?: Date };
      payoffVerification: { required: boolean; completed: boolean; date?: Date };
      vehicleInspection: { required: boolean; completed: boolean; date?: Date };
      emissionsTest: { required: boolean; completed: boolean; date?: Date };
      safetyInspection: { required: boolean; completed: boolean; date?: Date };
      finalInspection: { required: boolean; completed: boolean; date?: Date };
    };
  };
  
  // Analytics & Reporting
  analytics: {
    timeMetrics: {
      totalTime: number;
      customerTime: number;
      negotiationTime: number;
      paperworkTime: number;
      fAndITime: number;
      deliveryTime: number;
    };
    touchPoints: {
      customerContacts: number;
      managementApprovals: number;
      bankCalls: number;
      tradeAppraisals: number;
      testDrives: number;
      demonstrations: number;
      followUps: number;
    };
    conversionMetrics: {
      leadSource: string;
      leadDate: Date;
      firstContact: Date;
      firstAppointment: Date;
      firstVisit: Date;
      testDrive: Date;
      creditApp: Date;
      dealStructure: Date;
      finalNegotiation: Date;
      contractSigning: Date;
      delivery: Date;
      funding: Date;
      totalCycleTime: number;
      conversionRate: number;
    };
    profitability: {
      frontEndGross: number;
      backEndGross: number;
      totalGross: number;
      packAmount: number;
      holdback: number;
      incentives: number;
      commissions: number;
      bonuses: number;
      costs: number;
      netProfit: number;
      profitMargin: number;
      returnOnInvestment: number;
    };
    customerSatisfaction: {
      salesProcess: number;
      financeProcess: number;
      deliveryProcess: number;
      overallExperience: number;
      recommendation: number;
      complaints: string[];
      compliments: string[];
    };
  };
  
  // Settings & Preferences
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      desktop: boolean;
    };
    display: {
      theme: 'light' | 'dark' | 'auto';
      density: 'compact' | 'normal' | 'comfortable';
      fontSize: 'small' | 'medium' | 'large';
      currency: 'USD' | 'CAD' | 'EUR';
      dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
      timeFormat: '12h' | '24h';
      numberFormat: 'US' | 'EU' | 'UK';
    };
    defaults: {
      term: number;
      apr: number;
      downPayment: number;
      tradeAllowance: number;
      docFee: number;
      processingFee: number;
      registrationFee: number;
      salesTax: number;
      extendedWarranty: boolean;
      gapInsurance: boolean;
      paintProtection: boolean;
      fabricProtection: boolean;
      maintenancePackage: boolean;
      tireCare: boolean;
      etching: boolean;
      alarmSystem: boolean;
    };
    permissions: {
      canEditPricing: boolean;
      canEditFinancing: boolean;
      canEditProducts: boolean;
      canEditCustomer: boolean;
      canEditVehicle: boolean;
      canEditTrade: boolean;
      canApproveDeals: boolean;
      canCancelDeals: boolean;
      canViewReports: boolean;
      canExportData: boolean;
      canManageUsers: boolean;
      canManageSettings: boolean;
      canAccessAdmin: boolean;
    };
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
    locked: boolean;
    lockedBy?: string;
    lockedAt?: Date;
    archived: boolean;
    archivedBy?: string;
    archivedAt?: Date;
    tags: string[];
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    source: string;
    campaign: string;
    referral: string;
    notes: string;
    attachments: {
      id: number;
      name: string;
      type: string;
      size: number;
      url: string;
      uploadedBy: string;
      uploadedAt: Date;
    }[];
  };
}

interface PaymentCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  principalPaid: number;
  interestPaid: number;
  amortizationSchedule: {
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

// Utility functions
const calculateTaxAndFees = (salePrice: number, zipCode: string, state: string) => {
  const taxRate = TAX_RATES_BY_STATE[state] || 0.06;
  const stateFee = STATE_FEES[state] || 25;
  const salesTax = salePrice * taxRate;
  
  return {
    salesTax,
    stateFees: stateFee,
    totalTaxAndFees: salesTax + stateFee
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercent = (rate: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rate / 100);
};

const generateDealNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `DEAL-${timestamp}-${random}`;
};

const generatePaymentSpreads = (financeAmount: number, baseRate: number) => {
  const spreads = [];
  const terms = [24, 36, 48, 60, 72, 84];
  const rates = [baseRate - 1, baseRate - 0.5, baseRate, baseRate + 0.5, baseRate + 1, baseRate + 1.5];
  
  terms.forEach(term => {
    rates.forEach(rate => {
      if (rate > 0) {
        const monthlyRate = rate / 100 / 12;
        const payment = financeAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                       (Math.pow(1 + monthlyRate, term) - 1);
        const totalInterest = (payment * term) - financeAmount;
        
        spreads.push({
          term,
          apr: rate,
          payment,
          totalInterest,
          bankName: rate <= baseRate ? 'Credit Union' : rate <= baseRate + 0.5 ? 'Bank A' : 'Bank B',
          program: rate <= baseRate ? 'Prime' : rate <= baseRate + 0.5 ? 'Standard' : 'Subprime',
          tier: rate <= baseRate ? 'A' : rate <= baseRate + 0.5 ? 'B' : 'C',
          approved: true,
          selected: false
        });
      }
    });
  });
  
  return spreads.sort((a, b) => a.payment - b.payment);
};

export default function DealDesk() {
  const [activeTab, setActiveTab] = useState("inventory-search");
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'stock' | 'vin' | 'general'>('stock');
  const [selectedVehicles, setSelectedVehicles] = useState<DealVehicle[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<DealCustomer | null>(null);
  const [showPaymentSpreads, setShowPaymentSpreads] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [customerState, setCustomerState] = useState("CA");
  
  const [deal, setDeal] = useState<Partial<DealStructure>>({
    dealNumber: generateDealNumber(),
    status: 'draft',
    priority: 'medium',
    createdBy: 'Current User',
    assignedTo: 'Current User',
    vehicles: [],
    primaryVehicle: 0,
    pricing: {
      totalVehiclePrice: 0,
      totalTradeValue: 0,
      netTradeValue: 0,
      cashDown: 0,
      netCashDown: 0,
      amountToFinance: 0,
      salesTax: 0,
      stateFees: 0,
      documentationFee: 599,
      processingFee: 199,
      otherFees: [],
      totalAmount: 0,
      netAmount: 0,
      grossProfit: 0,
      netProfit: 0,
      frontEndGross: 0,
      backEndGross: 0,
      totalGross: 0,
      holdback: 0,
      incentives: 0,
      spiff: 0,
      commissionRate: 0.25,
      commissionAmount: 0,
      managerBonus: 0,
      packAmount: 2500,
      floorPlanCost: 0,
      carryingCost: 0,
      reconditioningCost: 0,
      advertisingCost: 0,
      otherCosts: []
    },
    financing: {
      type: 'retail',
      lender: '',
      program: '',
      term: 60,
      apr: 7.5,
      payment: 0,
      totalInterest: 0,
      totalOfPayments: 0,
      advancePayments: 0,
      deferredPayments: 0,
      balloonPayment: 0,
      buyRate: 6.5,
      sellRate: 7.5,
      rateMarkup: 1.0,
      reserveAmount: 0,
      participationRate: 0.80,
      residualValue: 0,
      moneyFactor: 0,
      acquisitionFee: 0,
      dispositionFee: 0,
      excessMileageCharge: 0.25,
      mileageAllowance: 12000,
      wearAndTearCoverage: false,
      gapCoverage: false,
      multipleSecurityDeposits: 0,
      paymentProtection: false,
      skipPaymentOption: false,
      downPaymentAssistance: 0,
      rebateAssignment: false,
      coSignerRequired: false,
      incomeVerification: true,
      employmentVerification: true,
      proofOfResidence: true,
      bankReferences: false,
      personalReferences: false,
      creditLifeInsurance: false,
      creditDisabilityInsurance: false,
      paymentMethod: 'auto_pay',
      paymentFrequency: 'monthly',
      firstPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 60 * 30 * 24 * 60 * 60 * 1000),
      paymentDueDate: 15,
      gracePeriod: 10,
      lateFee: 25,
      returnedCheckFee: 35,
      prepaymentPenalty: false,
      refinanceProtection: false,
      defaultRate: 18.0,
      repossessionFee: 500,
      collectionFee: 100
    },
    products: {
      extendedWarranty: {
        selected: false,
        provider: '',
        term: 0,
        mileage: 0,
        coverage: '',
        deductible: 0,
        cost: 0,
        markup: 0,
        commission: 0
      },
      gapInsurance: {
        selected: false,
        provider: '',
        term: 0,
        coverage: 0,
        cost: 0,
        markup: 0,
        commission: 0
      },
      paintProtection: {
        selected: false,
        provider: '',
        warranty: '',
        cost: 0,
        markup: 0,
        commission: 0
      },
      fabricProtection: {
        selected: false,
        provider: '',
        warranty: '',
        cost: 0,
        markup: 0,
        commission: 0
      },
      maintenancePackage: {
        selected: false,
        provider: '',
        term: 0,
        services: [],
        cost: 0,
        markup: 0,
        commission: 0
      },
      tireCare: {
        selected: false,
        provider: '',
        term: 0,
        coverage: '',
        cost: 0,
        markup: 0,
        commission: 0
      },
      etching: {
        selected: false,
        provider: '',
        warranty: '',
        cost: 0,
        markup: 0,
        commission: 0
      },
      alarmSystem: {
        selected: false,
        provider: '',
        features: [],
        cost: 0,
        markup: 0,
        commission: 0
      },
      customAccessories: {
        selected: false,
        items: [],
        totalCost: 0,
        totalMarkup: 0,
        totalCommission: 0
      }
    },
    payments: {
      structures: [],
      selectedStructure: 0,
      customStructure: {
        enabled: false,
        term: 60,
        apr: 7.5,
        payment: 0,
        bankName: '',
        program: '',
        conditions: []
      },
      paymentSpread: {
        show: false,
        options: []
      },
      calculatorHistory: []
    }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers and vehicles
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate payment and deal metrics
  const calculatePayment = (principal: number, rate: number, term: number): PaymentCalculation => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term;
    
    if (monthlyRate === 0) {
      return {
        monthlyPayment: principal / numPayments,
        totalInterest: 0,
        totalCost: principal,
        principalPaid: principal,
        interestPaid: 0,
        amortizationSchedule: []
      };
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalCost = monthlyPayment * numPayments;
    const totalInterest = totalCost - principal;
    
    // Generate amortization schedule
    const schedule: PaymentCalculation['amortizationSchedule'] = [];
    let balance = principal;
    
    for (let i = 0; i < numPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return {
      monthlyPayment,
      totalInterest,
      totalCost,
      principalPaid: principal,
      interestPaid: totalInterest,
      amortizationSchedule: schedule
    };
  };

  // Update deal calculations when values change
  const updateDealCalculations = () => {
    if (!deal.pricing) return;
    
    const taxAndFees = calculateTaxAndFees(deal.pricing.totalVehiclePrice || 0, zipCode, customerState);
    const amountToFinance = (deal.pricing.totalVehiclePrice || 0) - (deal.pricing.totalTradeValue || 0) - (deal.pricing.cashDown || 0);
    const calculation = calculatePayment(amountToFinance, deal.financing?.apr || 7.5, deal.financing?.term || 60);
    
    setDeal(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing!,
        salesTax: taxAndFees.salesTax,
        stateFees: taxAndFees.stateFees,
        amountToFinance,
        totalAmount: (prev.pricing?.totalVehiclePrice || 0) + taxAndFees.totalTaxAndFees + (prev.pricing?.documentationFee || 0) + (prev.pricing?.processingFee || 0)
      },
      financing: {
        ...prev.financing!,
        payment: calculation.monthlyPayment,
        totalInterest: calculation.totalInterest,
        totalOfPayments: calculation.totalCost
      }
    }));
  };

  // Search vehicles by stock number or VIN
  const searchVehicles = () => {
    if (!searchTerm || !vehicles) return vehicles;
    
    const term = searchTerm.toLowerCase();
    return vehicles.filter(vehicle => {
      switch (searchType) {
        case 'stock':
          return vehicle.id.toString().includes(term);
        case 'vin':
          return vehicle.id.toString().includes(term); // Using ID as VIN placeholder
        case 'general':
          return (
            vehicle.make.toLowerCase().includes(term) ||
            vehicle.model.toLowerCase().includes(term) ||
            vehicle.year.toString().includes(term) ||
            vehicle.color.toLowerCase().includes(term)
          );
        default:
          return true;
      }
    });
  };

  // Add vehicle to deal
  const addVehicleToDeal = (vehicle: Vehicle) => {
    const dealVehicle: DealVehicle = {
      id: vehicle.id,
      stockNumber: vehicle.id.toString(),
      vin: vehicle.id.toString(),
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: '',
      price: vehicle.price,
      mileage: vehicle.mileage,
      color: vehicle.color,
      category: vehicle.category,
      status: vehicle.status,
      cost: vehicle.price * 0.85,
      bookValue: vehicle.price * 0.90,
      marketValue: vehicle.price,
      daysOnLot: 30,
      images: [],
      features: [],
      condition: 'used',
      transmission: 'automatic',
      fuelType: 'gasoline',
      bodyStyle: 'sedan',
      drivetrain: 'fwd',
      engine: '2.0L',
      exteriorColor: vehicle.color,
      interiorColor: 'black',
      certified: false,
      warranty: 'basic',
      carfaxAvailable: true,
      serviceRecords: true,
      previousOwners: 1,
      accidents: 0,
      location: 'main lot',
      lotPosition: 'A-1',
      salesPerson: 'Current User',
      acquisitionDate: new Date(),
      reconditioning: 500,
      holdback: 1000,
      incentives: 0,
      floorPlan: 200,
      packAmount: 2500,
      competitorPricing: {
        averagePrice: vehicle.price,
        lowestPrice: vehicle.price * 0.95,
        highestPrice: vehicle.price * 1.05,
        marketPosition: 'competitive'
      }
    };
    
    setSelectedVehicles(prev => [...prev, dealVehicle]);
    setDeal(prev => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), dealVehicle],
      pricing: {
        ...prev.pricing!,
        totalVehiclePrice: (prev.pricing?.totalVehiclePrice || 0) + vehicle.price
      }
    }));
    
    updateDealCalculations();
  };

  // Generate payment spreads
  const generatePaymentOptions = () => {
    const amountToFinance = (deal.pricing?.amountToFinance || 0);
    const baseRate = deal.financing?.apr || 7.5;
    const spreads = generatePaymentSpreads(amountToFinance, baseRate);
    
    setDeal(prev => ({
      ...prev,
      payments: {
        ...prev.payments!,
        paymentSpread: {
          show: true,
          options: spreads
        }
      }
    }));
    
    setShowPaymentSpreads(true);
  };

  // Save deal
  const saveDeal = useMutation({
    mutationFn: async (dealData: Partial<DealStructure>) => {
      return await apiRequest('/api/deals', {
        method: 'POST',
        body: JSON.stringify(dealData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Deal Saved",
        description: "Deal structure has been saved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save deal",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deal Desk</h2>
            <p className="text-gray-500">Comprehensive deal structuring and analysis</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setDeal({
                dealNumber: generateDealNumber(),
                status: 'draft',
                priority: 'medium',
                createdBy: 'Current User',
                assignedTo: 'Current User',
                vehicles: [],
                primaryVehicle: 0,
                pricing: {
                  totalVehiclePrice: 0,
                  totalTradeValue: 0,
                  netTradeValue: 0,
                  cashDown: 0,
                  netCashDown: 0,
                  amountToFinance: 0,
                  salesTax: 0,
                  stateFees: 0,
                  documentationFee: 599,
                  processingFee: 199,
                  otherFees: [],
                  totalAmount: 0,
                  netAmount: 0,
                  grossProfit: 0,
                  netProfit: 0,
                  frontEndGross: 0,
                  backEndGross: 0,
                  totalGross: 0,
                  holdback: 0,
                  incentives: 0,
                  spiff: 0,
                  commissionRate: 0.25,
                  commissionAmount: 0,
                  managerBonus: 0,
                  packAmount: 2500,
                  floorPlanCost: 0,
                  carryingCost: 0,
                  reconditioningCost: 0,
                  advertisingCost: 0,
                  otherCosts: []
                },
                financing: {
                  type: 'retail',
                  lender: '',
                  program: '',
                  term: 60,
                  apr: 7.5,
                  payment: 0,
                  totalInterest: 0,
                  totalOfPayments: 0,
                  advancePayments: 0,
                  deferredPayments: 0,
                  balloonPayment: 0,
                  buyRate: 6.5,
                  sellRate: 7.5,
                  rateMarkup: 1.0,
                  reserveAmount: 0,
                  participationRate: 0.80,
                  residualValue: 0,
                  moneyFactor: 0,
                  acquisitionFee: 0,
                  dispositionFee: 0,
                  excessMileageCharge: 0.25,
                  mileageAllowance: 12000,
                  wearAndTearCoverage: false,
                  gapCoverage: false,
                  multipleSecurityDeposits: 0,
                  paymentProtection: false,
                  skipPaymentOption: false,
                  downPaymentAssistance: 0,
                  rebateAssignment: false,
                  coSignerRequired: false,
                  incomeVerification: true,
                  employmentVerification: true,
                  proofOfResidence: true,
                  bankReferences: false,
                  personalReferences: false,
                  creditLifeInsurance: false,
                  creditDisabilityInsurance: false,
                  paymentMethod: 'auto_pay',
                  paymentFrequency: 'monthly',
                  firstPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  maturityDate: new Date(Date.now() + 60 * 30 * 24 * 60 * 60 * 1000),
                  paymentDueDate: 15,
                  gracePeriod: 10,
                  lateFee: 25,
                  returnedCheckFee: 35,
                  prepaymentPenalty: false,
                  refinanceProtection: false,
                  defaultRate: 18.0,
                  repossessionFee: 500,
                  collectionFee: 100
                }
              });
              setSelectedVehicles([]);
              setSelectedCustomer(null);
              setSearchTerm("");
              setZipCode("");
              setShowPaymentSpreads(false);
            }}>
              New Deal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => saveDeal.mutate(deal)}
              disabled={saveDeal.isPending}
            >
              {saveDeal.isPending ? 'Saving...' : 'Save Deal'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isMobileView ? 'grid-cols-2' : 'grid-cols-5'}`}>
            <TabsTrigger value="inventory-search">Inventory Search</TabsTrigger>
            <TabsTrigger value="deal-structure">Deal Structure</TabsTrigger>
            <TabsTrigger value="payment-calc">Payment Calculator</TabsTrigger>
            <TabsTrigger value="profit-analysis">Profit Analysis</TabsTrigger>
            <TabsTrigger value="f-and-i">F&I Products</TabsTrigger>
          </TabsList>

          {/* Inventory Search Tab */}
          <TabsContent value="inventory-search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Vehicle Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="searchType">Search Type</Label>
                      <Select value={searchType} onValueChange={(value: 'stock' | 'vin' | 'general') => setSearchType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select search type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stock">Stock Number</SelectItem>
                          <SelectItem value="vin">VIN</SelectItem>
                          <SelectItem value="general">General Search</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="searchTerm">Search Term</Label>
                      <Input
                        id="searchTerm"
                        placeholder={`Enter ${searchType === 'stock' ? 'stock number' : searchType === 'vin' ? 'VIN' : 'search term'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode">Customer Zip Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="Enter zip code for tax calculation"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerState">Customer State</Label>
                      <Select value={customerState} onValueChange={setCustomerState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(TAX_RATES_BY_STATE).map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Tax Information</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Tax Rate: {formatPercent(TAX_RATES_BY_STATE[customerState] || 0.06)}
                      </p>
                      <p className="text-sm text-blue-700">
                        State Fee: {formatCurrency(STATE_FEES[customerState] || 25)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vehicle Results */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Available Vehicles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchVehicles()?.map(vehicle => (
                        <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h3>
                                <Badge variant="outline">{vehicle.category}</Badge>
                                <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                                  {vehicle.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>Stock #: {vehicle.id}</div>
                                <div>Mileage: {vehicle.mileage.toLocaleString()} miles</div>
                                <div>Color: {vehicle.color}</div>
                                <div>Price: {formatCurrency(vehicle.price)}</div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => addVehicleToDeal(vehicle)}
                                disabled={selectedVehicles.some(v => v.id === vehicle.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Deal
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Selected Vehicles */}
            {selectedVehicles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Selected Vehicles ({selectedVehicles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVehicles.map(vehicle => (
                      <div key={vehicle.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h4>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedVehicles(prev => prev.filter(v => v.id !== vehicle.id));
                              setDeal(prev => ({
                                ...prev,
                                vehicles: prev.vehicles?.filter(v => v.id !== vehicle.id) || [],
                                pricing: {
                                  ...prev.pricing!,
                                  totalVehiclePrice: (prev.pricing?.totalVehiclePrice || 0) - vehicle.price
                                }
                              }));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">Stock: {vehicle.stockNumber}</p>
                        <p className="text-sm text-gray-600">Price: {formatCurrency(vehicle.price)}</p>
                        <p className="text-sm text-gray-600">Mileage: {vehicle.mileage.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deal Structure Tab */}
          <TabsContent value="deal-structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deal Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Deal Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Deal Number</Label>
                      <p className="text-sm text-gray-600">{deal.dealNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={deal.status === 'draft' ? 'secondary' : 'default'}>
                        {deal.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Pricing Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Vehicle Price:</span>
                        <span>{formatCurrency(deal.pricing?.totalVehiclePrice || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trade Value:</span>
                        <span>-{formatCurrency(deal.pricing?.totalTradeValue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash Down:</span>
                        <span>-{formatCurrency(deal.pricing?.cashDown || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales Tax:</span>
                        <span>{formatCurrency(deal.pricing?.salesTax || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Fees:</span>
                        <span>{formatCurrency(deal.pricing?.stateFees || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Doc Fee:</span>
                        <span>{formatCurrency(deal.pricing?.documentationFee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee:</span>
                        <span>{formatCurrency(deal.pricing?.processingFee || 0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Amount to Finance:</span>
                        <span>{formatCurrency(deal.pricing?.amountToFinance || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tradeValue">Trade-In Value</Label>
                    <Input
                      id="tradeValue"
                      type="number"
                      value={deal.pricing?.totalTradeValue || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeal(prev => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing!,
                            totalTradeValue: value
                          }
                        }));
                      }}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cashDown">Cash Down</Label>
                    <Input
                      id="cashDown"
                      type="number"
                      value={deal.pricing?.cashDown || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeal(prev => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing!,
                            cashDown: value
                          }
                        }));
                      }}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="docFee">Documentation Fee</Label>
                    <Input
                      id="docFee"
                      type="number"
                      value={deal.pricing?.documentationFee || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeal(prev => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing!,
                            documentationFee: value
                          }
                        }));
                      }}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="processingFee">Processing Fee</Label>
                    <Input
                      id="processingFee"
                      type="number"
                      value={deal.pricing?.processingFee || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeal(prev => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing!,
                            processingFee: value
                          }
                        }));
                      }}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Calculator Tab */}
          <TabsContent value="payment-calc" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financing Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Financing Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="term">Term (months)</Label>
                    <Select 
                      value={deal.financing?.term.toString() || "60"} 
                      onValueChange={(value) => {
                        setDeal(prev => ({
                          ...prev,
                          financing: {
                            ...prev.financing!,
                            term: parseInt(value)
                          }
                        }));
                        updateDealCalculations();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                        <SelectItem value="72">72 months</SelectItem>
                        <SelectItem value="84">84 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="apr">APR (%)</Label>
                    <Input
                      id="apr"
                      type="number"
                      step="0.1"
                      value={deal.financing?.apr || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeal(prev => ({
                          ...prev,
                          financing: {
                            ...prev.financing!,
                            apr: value
                          }
                        }));
                      }}
                      onBlur={updateDealCalculations}
                    />
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Calculated Payment</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(deal.financing?.payment || 0)}/month
                    </p>
                    <p className="text-sm text-green-700">
                      Total Interest: {formatCurrency(deal.financing?.totalInterest || 0)}
                    </p>
                    <p className="text-sm text-green-700">
                      Total of Payments: {formatCurrency(deal.financing?.totalOfPayments || 0)}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={generatePaymentOptions}
                    disabled={!deal.pricing?.amountToFinance}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Payment Spreads
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Spreads */}
              {showPaymentSpreads && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Payment Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {deal.payments?.paymentSpread?.options?.slice(0, 12).map((option, index) => (
                        <div 
                          key={index}
                          className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setDeal(prev => ({
                              ...prev,
                              financing: {
                                ...prev.financing!,
                                term: option.term,
                                apr: option.apr,
                                payment: option.payment,
                                totalInterest: option.totalInterest
                              }
                            }));
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {formatCurrency(option.payment)}/month
                              </div>
                              <div className="text-sm text-gray-600">
                                {option.term} months @ {formatPercent(option.apr)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{option.bankName}</div>
                              <div className="text-sm text-gray-600">{option.program}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Profit Analysis Tab */}
          <TabsContent value="profit-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" />
                    Front End Gross
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(deal.pricing?.frontEndGross || 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Vehicle profit margin</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Back End Gross
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(deal.pricing?.backEndGross || 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">F&I product profit</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Total Gross
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(deal.pricing?.totalGross || 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Combined profit</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* F&I Products Tab */}
          <TabsContent value="f-and-i" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Protection Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="extendedWarranty"
                      checked={deal.products?.extendedWarranty?.selected || false}
                      onChange={(e) => {
                        setDeal(prev => ({
                          ...prev,
                          products: {
                            ...prev.products!,
                            extendedWarranty: {
                              ...prev.products?.extendedWarranty!,
                              selected: e.target.checked
                            }
                          }
                        }));
                      }}
                    />
                    <label htmlFor="extendedWarranty">Extended Warranty</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="gapInsurance"
                      checked={deal.products?.gapInsurance?.selected || false}
                      onChange={(e) => {
                        setDeal(prev => ({
                          ...prev,
                          products: {
                            ...prev.products!,
                            gapInsurance: {
                              ...prev.products?.gapInsurance!,
                              selected: e.target.checked
                            }
                          }
                        }));
                      }}
                    />
                    <label htmlFor="gapInsurance">GAP Insurance</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="paintProtection"
                      checked={deal.products?.paintProtection?.selected || false}
                      onChange={(e) => {
                        setDeal(prev => ({
                          ...prev,
                          products: {
                            ...prev.products!,
                            paintProtection: {
                              ...prev.products?.paintProtection!,
                              selected: e.target.checked
                            }
                          }
                        }));
                      }}
                    />
                    <label htmlFor="paintProtection">Paint Protection</label>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Product Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Extended Warranty:</span>
                      <span>
                        {deal.products?.extendedWarranty?.selected ? 
                          formatCurrency(deal.products?.extendedWarranty?.cost || 0) : 
                          'Not selected'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GAP Insurance:</span>
                      <span>
                        {deal.products?.gapInsurance?.selected ? 
                          formatCurrency(deal.products?.gapInsurance?.cost || 0) : 
                          'Not selected'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paint Protection:</span>
                      <span>
                        {deal.products?.paintProtection?.selected ? 
                          formatCurrency(deal.products?.paintProtection?.cost || 0) : 
                          'Not selected'
                        }
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total F&I:</span>
                      <span>
                        {formatCurrency(
                          (deal.products?.extendedWarranty?.selected ? deal.products?.extendedWarranty?.cost || 0 : 0) +
                          (deal.products?.gapInsurance?.selected ? deal.products?.gapInsurance?.cost || 0 : 0) +
                          (deal.products?.paintProtection?.selected ? deal.products?.paintProtection?.cost || 0 : 0)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
