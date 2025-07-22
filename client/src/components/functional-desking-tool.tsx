import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileDeskingTool as MobileDeskingToolComponent } from "./mobile-desking-tool";
import { 
  Calculator, 
  DollarSign, 
  Car, 
  User, 
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  Settings,
  RefreshCw
} from "lucide-react";

interface DeskingToolProps {
  dealId?: string;
  onSave?: (data: any) => void;
}

export function FunctionalDeskingTool({ dealId, onSave }: DeskingToolProps) {
  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    // Vehicle Information
    stockNumber: "KM5543",
    year: "2023",
    make: "Toyota",
    model: "Camry",
    trim: "LE",
    vin: "1HGBH41JXMN109186",
    mileage: 12456,
    exteriorColor: "Midnight Black Metallic",
    interiorColor: "Black",
    
    // Pricing (stored as numbers for calculations)
    msrp: 28995,
    sellingPrice: 26500,
    tradeValue: 15000,
    tradePayoff: 12800,
    tradeEquity: 2200,
    cashDown: 3000,
    totalDown: 5200,
    
    // Finance Information
    apr: 5.99,
    term: 60,
    payment: 387.45,
    
    // Dealer Adds
    extendedWarranty: 2495,
    gapInsurance: 895,
    paintProtection: 599,
    rustProofing: 399,
    securitySystem: 299,
    
    // Trade Information
    tradeYear: "2018",
    tradeMake: "Honda",
    tradeModel: "Accord",
    tradeMileage: 85420,
    tradeCondition: "Good",
    
    // Customer Information
    customerName: "Steve Dunn",
    customerAddress: "123 Main St, Anytown, ST 12345",
    customerPhone: "(555) 123-4567",
    customerEmail: "steve.dunn@email.com",
    creditScore: 720,
    
    // Sales Information
    salesperson: "Mike Craft",
    manager: "Tom Davis",
    dealType: "Purchase",
    financeCompany: "Toyota Financial",
    
    // Additional Fees
    docFee: 299,
    taxRate: 7.25,
    licenseTitle: 150,
    
    // Calculated Fields
    totalDealerAdds: 0,
    salesTax: 0,
    totalFees: 0,
    amountFinanced: 0,
    totalInterest: 0,
    totalOfPayments: 0
  });

  // Update field values
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-calculate dependent fields
  useEffect(() => {
    const calculateTotals = () => {
      // Calculate dealer adds total
      const dealerAddsTotal = 
        formData.extendedWarranty + 
        formData.gapInsurance + 
        formData.paintProtection + 
        formData.rustProofing + 
        formData.securitySystem;

      // Calculate trade equity
      const tradeEquity = formData.tradeValue - formData.tradePayoff;

      // Calculate total down payment
      const totalDown = formData.cashDown + Math.max(0, tradeEquity);

      // Calculate sales tax (on selling price + dealer adds)
      const taxableAmount = formData.sellingPrice + dealerAddsTotal;
      const salesTax = (taxableAmount * formData.taxRate) / 100;

      // Calculate total fees
      const totalFees = formData.docFee + formData.licenseTitle + salesTax;

      // Calculate amount financed
      const amountFinanced = formData.sellingPrice + dealerAddsTotal + totalFees - totalDown;

      // Calculate total interest and payments
      const monthlyRate = formData.apr / 100 / 12;
      const numPayments = formData.term;
      
      let payment = 0;
      if (monthlyRate > 0 && amountFinanced > 0) {
        payment = (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
      } else {
        payment = amountFinanced / numPayments;
      }

      const totalOfPayments = payment * numPayments;
      const totalInterest = totalOfPayments - amountFinanced;

      setFormData(prev => ({
        ...prev,
        totalDealerAdds: dealerAddsTotal,
        tradeEquity: tradeEquity,
        totalDown: totalDown,
        salesTax: salesTax,
        totalFees: totalFees,
        amountFinanced: amountFinanced,
        payment: payment,
        totalInterest: totalInterest,
        totalOfPayments: totalOfPayments
      }));
    };

    calculateTotals();
  }, [
    formData.sellingPrice, formData.extendedWarranty, formData.gapInsurance, 
    formData.paintProtection, formData.rustProofing, formData.securitySystem,
    formData.tradeValue, formData.tradePayoff, formData.cashDown,
    formData.docFee, formData.licenseTitle, formData.taxRate,
    formData.apr, formData.term
  ]);

  const handleSave = () => {
    onSave?.(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const makeOptions = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi", "Lexus", "Acura"];
  const colorOptions = ["Black", "White", "Silver", "Red", "Blue", "Gray", "Beige", "Brown"];
  const financeCompanies = ["Toyota Financial", "Honda Finance", "Ford Credit", "Chase Auto", "Wells Fargo", "Capital One", "Ally Financial"];
  const termOptions = [24, 36, 48, 60, 72, 84];

  // Return mobile version on small screens
  if (isMobile) {
    return <MobileDeskingToolComponent dealId={dealId} onSave={onSave} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="bg-white border border-gray-300 rounded-t-lg shadow-sm">
          <div className="bg-blue-600 text-white px-3 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-6 text-xs md:text-sm">
              <span className="font-medium">Deal Desk</span>
              <span className="hidden sm:inline">Deal #{dealId}</span>
              <span className="bg-green-600 px-2 md:px-3 py-1 rounded text-xs">Active</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 h-8 px-2 md:px-3">
                <Printer className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Print</span>
              </Button>
              <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 h-8 px-2 md:px-3">
                <Save className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Save</span>
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 h-8 px-2 md:px-3">
                <Calculator className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Calculate</span>
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="p-2 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
            
            {/* Left Column - Vehicle & Customer Info */}
            <div className="space-y-3 md:space-y-6">
              {/* Vehicle Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Stock Number</Label>
                      <Input 
                        value={formData.stockNumber}
                        onChange={(e) => updateField('stockNumber', e.target.value)}
                        className="h-10 md:h-8 text-base md:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Year</Label>
                      <Select value={formData.year} onValueChange={(value) => updateField('year', value)}>
                        <SelectTrigger className="h-10 md:h-8 text-base md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Make</Label>
                      <Select value={formData.make} onValueChange={(value) => updateField('make', value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {makeOptions.map(make => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Model</Label>
                      <Input 
                        value={formData.model}
                        onChange={(e) => updateField('model', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">VIN</Label>
                    <Input 
                      value={formData.vin}
                      onChange={(e) => updateField('vin', e.target.value)}
                      className="h-8 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Exterior Color</Label>
                      <Select value={formData.exteriorColor} onValueChange={(value) => updateField('exteriorColor', value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(color => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mileage</Label>
                      <Input 
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Customer Name</Label>
                    <Input 
                      value={formData.customerName}
                      onChange={(e) => updateField('customerName', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input 
                      value={formData.customerPhone}
                      onChange={(e) => updateField('customerPhone', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input 
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => updateField('customerEmail', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Credit Score</Label>
                      <Input 
                        type="number"
                        value={formData.creditScore}
                        onChange={(e) => updateField('creditScore', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Salesperson</Label>
                      <Input 
                        value={formData.salesperson}
                        onChange={(e) => updateField('salesperson', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Column - Pricing & Trade */}
            <div className="space-y-3 md:space-y-6">
              {/* Pricing Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Pricing Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4">
                  <div>
                    <Label className="text-sm font-medium">MSRP</Label>
                    <Input 
                      type="number"
                      value={formData.msrp}
                      onChange={(e) => updateField('msrp', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(formData.msrp)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Selling Price</Label>
                    <Input 
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => updateField('sellingPrice', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(formData.sellingPrice)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cash Down</Label>
                    <Input 
                      type="number"
                      value={formData.cashDown}
                      onChange={(e) => updateField('cashDown', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(formData.cashDown)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <RefreshCw className="w-5 h-5 mr-2 text-orange-600" />
                    Trade Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Year</Label>
                      <Input 
                        value={formData.tradeYear}
                        onChange={(e) => updateField('tradeYear', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Make</Label>
                      <Select value={formData.tradeMake} onValueChange={(value) => updateField('tradeMake', value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {makeOptions.map(make => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Model</Label>
                      <Input 
                        value={formData.tradeModel}
                        onChange={(e) => updateField('tradeModel', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Trade Value</Label>
                      <Input 
                        type="number"
                        value={formData.tradeValue}
                        onChange={(e) => updateField('tradeValue', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(formData.tradeValue)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Trade Payoff</Label>
                      <Input 
                        type="number"
                        value={formData.tradePayoff}
                        onChange={(e) => updateField('tradePayoff', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(formData.tradePayoff)}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border">
                    <Label className="text-sm font-medium">Trade Equity</Label>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(formData.tradeEquity)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Dealer Adds */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Plus className="w-5 h-5 mr-2 text-purple-600" />
                    Dealer Add-Ons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Extended Warranty</Label>
                      <Input 
                        type="number"
                        value={formData.extendedWarranty}
                        onChange={(e) => updateField('extendedWarranty', parseFloat(e.target.value) || 0)}
                        className="h-7 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">GAP Insurance</Label>
                      <Input 
                        type="number"
                        value={formData.gapInsurance}
                        onChange={(e) => updateField('gapInsurance', parseFloat(e.target.value) || 0)}
                        className="h-7 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Paint Protection</Label>
                      <Input 
                        type="number"
                        value={formData.paintProtection}
                        onChange={(e) => updateField('paintProtection', parseFloat(e.target.value) || 0)}
                        className="h-7 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Rust Proofing</Label>
                      <Input 
                        type="number"
                        value={formData.rustProofing}
                        onChange={(e) => updateField('rustProofing', parseFloat(e.target.value) || 0)}
                        className="h-7 text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded border">
                    <Label className="text-xs font-medium">Total Add-Ons</Label>
                    <p className="text-sm font-bold text-purple-600">{formatCurrency(formData.totalDealerAdds)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Finance & Calculations */}
            <div className="space-y-3 md:space-y-6">
              {/* Finance Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                    Finance Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Finance Company</Label>
                    <Select value={formData.financeCompany} onValueChange={(value) => updateField('financeCompany', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {financeCompanies.map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">APR (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.apr}
                        onChange={(e) => updateField('apr', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Term (months)</Label>
                      <Select value={formData.term.toString()} onValueChange={(value) => updateField('term', parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {termOptions.map(term => (
                            <SelectItem key={term} value={term.toString()}>{term} months</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Doc Fee</Label>
                      <Input 
                        type="number"
                        value={formData.docFee}
                        onChange={(e) => updateField('docFee', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tax Rate (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-green-700">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Selling Price:</span>
                    <span className="font-bold">{formatCurrency(formData.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Dealer Adds:</span>
                    <span className="font-bold">{formatCurrency(formData.totalDealerAdds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sales Tax:</span>
                    <span className="font-bold">{formatCurrency(formData.salesTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Fees:</span>
                    <span className="font-bold">{formatCurrency(formData.totalFees)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm">Total Down:</span>
                    <span className="font-bold">{formatCurrency(formData.totalDown)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Amount Financed:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(formData.amountFinanced)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Payment:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(formData.payment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Interest:</span>
                    <span className="font-bold">{formatCurrency(formData.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total of Payments:</span>
                    <span className="font-bold">{formatCurrency(formData.totalOfPayments)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={handleSave} className="w-full h-12 md:h-10 bg-blue-600 hover:bg-blue-700 text-base md:text-sm">
                  <Save className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                  Save Deal Structure
                </Button>
                <Button variant="outline" className="w-full h-12 md:h-10 text-base md:text-sm">
                  <Printer className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                  Print Deal Sheet
                </Button>
                <Button variant="outline" className="w-full h-12 md:h-10 text-base md:text-sm">
                  <FileText className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                  Generate Paperwork
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}