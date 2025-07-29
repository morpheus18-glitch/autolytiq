import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Calculator, 
  DollarSign, 
  User, 
  Car,
  FileText,
  Printer,
  Save,
  Zap,
  TrendingUp,
  Target,
  CreditCard,
  Building,
  Phone,
  Mail,
  Calendar,
  Percent,
  CheckCircle,
  RefreshCw,
  MessageSquare,
  Clock,
  Edit
} from "lucide-react";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  creditScore?: number;
}

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  vin?: string;
  mileage?: number;
  stock?: string;
}

interface DealStructure {
  salesPrice: number;
  cashDown: number;
  ttl: number;
  rebates: number;
  docFee: number;
  otherFrontEnd: number;
  tradeIn: boolean;
  warrantyPrice: number;
  gapPrice: number;
  otherBackEnd: number;
  term: number;
  buyRate: number;
  aprRate: boolean;
  totalFrontEnd: number;
  totalBackEnd: number;
  amountFinanced: number;
  estimatedMonthlyPayment: number;
}

export default function ProfessionalDealDesk() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Deal structure state matching the VinSolutions format
  const [dealStructure, setDealStructure] = useState<DealStructure>({
    salesPrice: 27954.00,
    cashDown: 32000.00,
    ttl: 0,
    rebates: 0.00,
    docFee: 295.00,
    otherFrontEnd: 94.75,
    tradeIn: false,
    warrantyPrice: 0.00,
    gapPrice: 0.00,
    otherBackEnd: 0.00,
    term: 84,
    buyRate: 9.80,
    aprRate: false,
    totalFrontEnd: 531.267,
    totalBackEnd: 0,
    amountFinanced: 533.800,
    estimatedMonthlyPayment: 559
  });

  // Sample customer data
  const customerData: Customer = {
    id: 1,
    firstName: "Brian",
    lastName: "Hinkle",
    email: "brian.hinkle@email.com",
    phone: "(555) 123-4567",
    creditScore: 750
  };

  // Sample vehicle data
  const vehicleData: Vehicle = {
    id: 1,
    year: 2025,
    make: "KIA",
    model: "SPORTAGE",
    trim: "NEW",
    price: 27954.00,
    vin: "KNDJ23AU7P5098968",
    mileage: 0,
    stock: "#50083"
  };

  const handleFieldChange = (field: keyof DealStructure, value: number | boolean) => {
    setDealStructure(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals
      updated.totalFrontEnd = updated.salesPrice - updated.cashDown + updated.ttl + updated.rebates + updated.docFee + updated.otherFrontEnd;
      updated.totalBackEnd = updated.warrantyPrice + updated.gapPrice + updated.otherBackEnd;
      updated.amountFinanced = updated.totalFrontEnd + updated.totalBackEnd - updated.cashDown;
      
      // Calculate monthly payment (simple calculation)
      const monthlyRate = updated.buyRate / 100 / 12;
      const numPayments = updated.term;
      if (monthlyRate > 0) {
        updated.estimatedMonthlyPayment = Math.round(
          (updated.amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
        );
      } else {
        updated.estimatedMonthlyPayment = Math.round(updated.amountFinanced / numPayments);
      }
      
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header matching VinSolutions style */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">ED</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Executive Diamond</h1>
                  <Badge variant="outline" className="text-xs">Eligible Contacts</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Congratulations! You've met your target goal for the month. Keep funding deals and to enjoy your benefits.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">3 days left</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Executive Diamond 6.7</div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              In Policy
            </Badge>
          </div>
        </div>
      </div>

      {/* Customer and Vehicle Info Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {customerData.firstName} {customerData.lastName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stock • Tier 4 • Group: Monthly Income: $7,764
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Sell Rate: 9.80%</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Buy Rate: $0</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Max Participation: 0%</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Est. Payment: $559</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <div className="px-6 py-4">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {vehicleData.year} {vehicleData.make} {vehicleData.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vehicleData.trim} • VIN {vehicleData.vin} • Stock {vehicleData.stock}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Update Structure
                </Button>
                <Button variant="outline" size="sm">
                  <Car className="w-4 h-4 mr-1" />
                  Change Vehicle
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Verify Income
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Fast Funding
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message Center
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Deal Structure Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Structure Section - Left Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Structure</CardTitle>
                  <Button variant="outline" size="sm">
                    <Clock className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sales Price and Cash Down Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sales Price</Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={dealStructure.salesPrice}
                        onChange={(e) => handleFieldChange('salesPrice', parseFloat(e.target.value) || 0)}
                        className="pl-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cash Down</Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={dealStructure.cashDown}
                        onChange={(e) => handleFieldChange('cashDown', parseFloat(e.target.value) || 0)}
                        className="pl-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">TTL</Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={dealStructure.ttl}
                        onChange={(e) => handleFieldChange('ttl', parseFloat(e.target.value) || 0)}
                        className="pl-8"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Rebates, Doc Fee, Other Front End Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rebates</Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={dealStructure.rebates}
                        onChange={(e) => handleFieldChange('rebates', parseFloat(e.target.value) || 0)}
                        className="pl-8"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Doc Fee</Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={dealStructure.docFee}
                        onChange={(e) => handleFieldChange('docFee', parseFloat(e.target.value) || 0)}
                        className="pl-8"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Dealer setting</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Other Front End</Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={dealStructure.otherFrontEnd}
                        onChange={(e) => handleFieldChange('otherFrontEnd', parseFloat(e.target.value) || 0)}
                        className="pl-8"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Trade-In Toggle */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trade-In</Label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dealStructure.tradeIn}
                      onChange={(e) => handleFieldChange('tradeIn', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">ON</span>
                  </div>
                </div>

                {/* Back End Section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Back End</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Warranty</Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          value={dealStructure.warrantyPrice}
                          onChange={(e) => handleFieldChange('warrantyPrice', parseFloat(e.target.value) || 0)}
                          className="pl-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">GAP</Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          value={dealStructure.gapPrice}
                          onChange={(e) => handleFieldChange('gapPrice', parseFloat(e.target.value) || 0)}
                          className="pl-8"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Other Back End</Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          value={dealStructure.otherBackEnd}
                          onChange={(e) => handleFieldChange('otherBackEnd', parseFloat(e.target.value) || 0)}
                          className="pl-8"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Terms and Totals */}
          <div className="space-y-4">
            {/* Terms Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Term</Label>
                  <div className="mt-1 relative">
                    <Input
                      type="number"
                      value={dealStructure.term}
                      onChange={(e) => handleFieldChange('term', parseInt(e.target.value) || 0)}
                      className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!dealStructure.aprRate}
                    onChange={() => handleFieldChange('aprRate', false)}
                    className="rounded"
                  />
                  <Label className="text-sm">Buy Rate</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={dealStructure.aprRate}
                    onChange={() => handleFieldChange('aprRate', true)}
                    className="rounded"
                  />
                  <Label className="text-sm">APR</Label>
                </div>
                
                <div>
                  <div className="mt-1 relative">
                    <Input
                      type="number"
                      value={dealStructure.buyRate}
                      onChange={(e) => handleFieldChange('buyRate', parseFloat(e.target.value) || 0)}
                      className=""
                      step="0.01"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Totals Card */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Front End</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${dealStructure.totalFrontEnd.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Back End</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${dealStructure.totalBackEnd.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount Financed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${dealStructure.amountFinanced.toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Est. Monthly Payment</span>
                    <span className="text-lg font-bold text-green-600">
                      ${dealStructure.estimatedMonthlyPayment}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full bg-gray-600 hover:bg-gray-700">
                <Calculator className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Update Callback
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}