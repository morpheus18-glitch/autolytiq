import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  DollarSign, 
  Car, 
  User, 
  FileText,
  Plus,
  Save,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  X
} from "lucide-react";

interface MobileDeskingToolProps {
  dealId?: string;
  onSave?: (data: any) => void;
}

export function MobileDeskingTool({ dealId, onSave }: MobileDeskingToolProps) {
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
    
    // Pricing
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

  const [activeTab, setActiveTab] = useState("vehicle");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Update field values
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setEditingField(null);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Auto-calculate dependent fields
  useEffect(() => {
    const calculateTotals = () => {
      const dealerAddsTotal = 
        formData.extendedWarranty + 
        formData.gapInsurance + 
        formData.paintProtection + 
        formData.rustProofing + 
        formData.securitySystem;

      const tradeEquity = formData.tradeValue - formData.tradePayoff;
      const totalDown = formData.cashDown + Math.max(0, tradeEquity);
      
      const taxableAmount = formData.sellingPrice + dealerAddsTotal;
      const salesTax = (taxableAmount * formData.taxRate) / 100;
      
      const totalFees = formData.docFee + formData.licenseTitle + salesTax;
      const amountFinanced = formData.sellingPrice + dealerAddsTotal + totalFees - totalDown;
      
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

  // Mobile-optimized field component
  const MobileField = ({ 
    label, 
    value, 
    field, 
    type = "text", 
    options = [],
    isSelect = false 
  }: {
    label: string;
    value: any;
    field: string;
    type?: string;
    options?: string[];
    isSelect?: boolean;
  }) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 active:bg-gray-50">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              {isSelect ? (
                <Select value={value.toString()} onValueChange={(val) => updateField(field, val)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={type}
                  value={value}
                  onChange={(e) => updateField(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              )}
              <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                <Check className="w-4 h-4 text-green-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-900 mt-1">
                {type === 'number' && typeof value === 'number' ? formatCurrency(value) : value}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingField(field)}
                className="text-blue-600 h-8 w-8"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Collapsible section component
  const CollapsibleSection = ({ 
    title, 
    icon, 
    children, 
    sectionKey,
    defaultExpanded = false 
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    sectionKey: string;
    defaultExpanded?: boolean;
  }) => {
    const isExpanded = expandedSections.includes(sectionKey) || defaultExpanded;

    useEffect(() => {
      if (defaultExpanded && !expandedSections.includes(sectionKey)) {
        setExpandedSections(prev => [...prev, sectionKey]);
      }
    }, [defaultExpanded, sectionKey]);

    return (
      <Card className="mb-4">
        <CardHeader 
          className="pb-2 cursor-pointer active:bg-gray-50"
          onClick={() => toggleSection(sectionKey)}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center">
              {icon}
              <span className="ml-2">{title}</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  const makeOptions = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi"];
  const colorOptions = ["Black", "White", "Silver", "Red", "Blue", "Gray"];
  const financeCompanies = ["Toyota Financial", "Honda Finance", "Ford Credit", "Chase Auto", "Wells Fargo"];
  const termOptions = ["24", "36", "48", "60", "72", "84"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Deal Desk</h1>
            <p className="text-sm opacity-90">Deal #{dealId}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-white border-white h-8">
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 h-8">
              <Calculator className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-b sticky top-16 z-40">
          <TabsTrigger value="vehicle" className="text-xs">Vehicle</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs">Finance</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
        </TabsList>

        {/* Vehicle Tab */}
        <TabsContent value="vehicle" className="p-4 space-y-4">
          <CollapsibleSection
            title="Vehicle Information"
            icon={<Car className="w-5 h-5 text-blue-600" />}
            sectionKey="vehicle-info"
            defaultExpanded
          >
            <div className="space-y-0">
              <MobileField
                label="Stock Number"
                value={formData.stockNumber}
                field="stockNumber"
              />
              <MobileField
                label="Year"
                value={formData.year}
                field="year"
                isSelect
                options={Array.from({length: 10}, (_, i) => (new Date().getFullYear() - i).toString())}
              />
              <MobileField
                label="Make"
                value={formData.make}
                field="make"
                isSelect
                options={makeOptions}
              />
              <MobileField
                label="Model"
                value={formData.model}
                field="model"
              />
              <MobileField
                label="VIN"
                value={formData.vin}
                field="vin"
              />
              <MobileField
                label="Mileage"
                value={formData.mileage}
                field="mileage"
                type="number"
              />
              <MobileField
                label="Exterior Color"
                value={formData.exteriorColor}
                field="exteriorColor"
                isSelect
                options={colorOptions}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Customer Information"
            icon={<User className="w-5 h-5 text-green-600" />}
            sectionKey="customer-info"
          >
            <div className="space-y-0">
              <MobileField
                label="Customer Name"
                value={formData.customerName}
                field="customerName"
              />
              <MobileField
                label="Phone"
                value={formData.customerPhone}
                field="customerPhone"
              />
              <MobileField
                label="Email"
                value={formData.customerEmail}
                field="customerEmail"
              />
              <MobileField
                label="Credit Score"
                value={formData.creditScore}
                field="creditScore"
                type="number"
              />
              <MobileField
                label="Salesperson"
                value={formData.salesperson}
                field="salesperson"
              />
            </div>
          </CollapsibleSection>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="p-4 space-y-4">
          <CollapsibleSection
            title="Vehicle Pricing"
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            sectionKey="pricing-info"
            defaultExpanded
          >
            <div className="space-y-0">
              <MobileField
                label="MSRP"
                value={formData.msrp}
                field="msrp"
                type="number"
              />
              <MobileField
                label="Selling Price"
                value={formData.sellingPrice}
                field="sellingPrice"
                type="number"
              />
              <MobileField
                label="Cash Down"
                value={formData.cashDown}
                field="cashDown"
                type="number"
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Trade Information"
            icon={<RefreshCw className="w-5 h-5 text-orange-600" />}
            sectionKey="trade-info"
          >
            <div className="space-y-0">
              <MobileField
                label="Trade Year"
                value={formData.tradeYear}
                field="tradeYear"
              />
              <MobileField
                label="Trade Make"
                value={formData.tradeMake}
                field="tradeMake"
                isSelect
                options={makeOptions}
              />
              <MobileField
                label="Trade Model"
                value={formData.tradeModel}
                field="tradeModel"
              />
              <MobileField
                label="Trade Value"
                value={formData.tradeValue}
                field="tradeValue"
                type="number"
              />
              <MobileField
                label="Trade Payoff"
                value={formData.tradePayoff}
                field="tradePayoff"
                type="number"
              />
              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <Label className="text-sm font-medium text-green-700">Trade Equity</Label>
                <p className="text-lg font-bold text-green-600">{formatCurrency(formData.tradeEquity)}</p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Dealer Add-Ons"
            icon={<Plus className="w-5 h-5 text-purple-600" />}
            sectionKey="dealer-adds"
          >
            <div className="space-y-0">
              <MobileField
                label="Extended Warranty"
                value={formData.extendedWarranty}
                field="extendedWarranty"
                type="number"
              />
              <MobileField
                label="GAP Insurance"
                value={formData.gapInsurance}
                field="gapInsurance"
                type="number"
              />
              <MobileField
                label="Paint Protection"
                value={formData.paintProtection}
                field="paintProtection"
                type="number"
              />
              <MobileField
                label="Rust Proofing"
                value={formData.rustProofing}
                field="rustProofing"
                type="number"
              />
              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <Label className="text-sm font-medium text-purple-700">Total Add-Ons</Label>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(formData.totalDealerAdds)}</p>
              </div>
            </div>
          </CollapsibleSection>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="p-4 space-y-4">
          <CollapsibleSection
            title="Finance Details"
            icon={<Calculator className="w-5 h-5 text-blue-600" />}
            sectionKey="finance-info"
            defaultExpanded
          >
            <div className="space-y-0">
              <MobileField
                label="Finance Company"
                value={formData.financeCompany}
                field="financeCompany"
                isSelect
                options={financeCompanies}
              />
              <MobileField
                label="APR (%)"
                value={formData.apr}
                field="apr"
                type="number"
              />
              <MobileField
                label="Term (months)"
                value={formData.term}
                field="term"
                isSelect
                options={termOptions}
              />
              <MobileField
                label="Doc Fee"
                value={formData.docFee}
                field="docFee"
                type="number"
              />
              <MobileField
                label="Tax Rate (%)"
                value={formData.taxRate}
                field="taxRate"
                type="number"
              />
            </div>
          </CollapsibleSection>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="p-4 space-y-4">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-green-700">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm font-medium">Selling Price:</span>
                  <span className="font-bold">{formatCurrency(formData.sellingPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm font-medium">Dealer Adds:</span>
                  <span className="font-bold">{formatCurrency(formData.totalDealerAdds)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm font-medium">Sales Tax:</span>
                  <span className="font-bold">{formatCurrency(formData.salesTax)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm font-medium">Total Down:</span>
                  <span className="font-bold">{formatCurrency(formData.totalDown)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-green-300">
                  <span className="text-sm font-medium">Amount Financed:</span>
                  <span className="font-bold text-blue-600">{formatCurrency(formData.amountFinanced)}</span>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-center">
                    <span className="text-sm text-green-700">Monthly Payment</span>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(formData.payment)}</p>
                    <span className="text-xs text-green-600">for {formData.term} months</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Total Interest:</span>
                  <span className="font-bold">{formatCurrency(formData.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Total of Payments:</span>
                  <span className="font-bold">{formatCurrency(formData.totalOfPayments)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pb-8">
            <Button onClick={handleSave} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg">
              <Save className="w-5 h-5 mr-2" />
              Save Deal Structure
            </Button>
            <Button variant="outline" className="w-full h-12 text-lg">
              <Printer className="w-5 h-5 mr-2" />
              Print Deal Sheet
            </Button>
            <Button variant="outline" className="w-full h-12 text-lg">
              <FileText className="w-5 h-5 mr-2" />
              Generate Paperwork
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}