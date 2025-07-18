import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Users, 
  Car, 
  CreditCard, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  Settings,
  Printer,
  Send,
  Save,
  Plus,
  Minus,
  Target,
  Shield,
  Wrench,
  Award,
  Clock,
  Info
} from 'lucide-react';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  cellPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  creditScore: number;
  income: number;
  status: string;
  salesConsultant: string;
  leadSource: string;
  notes: string;
  createdAt: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  status: string;
  description: string;
  createdAt: string;
}

interface DealData {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  loanTerm: number;
  interestRate: number;
  salesTax: number;
  fees: number;
  rebates: number;
  gapInsurance: number;
  extendedWarranty: number;
  accessories: number;
}

interface Calculations {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  totalDue: number;
}

export default function ProfessionalDealDesk() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [dealData, setDealData] = useState<DealData>({
    vehiclePrice: 0,
    downPayment: 0,
    tradeInValue: 0,
    loanTerm: 60,
    interestRate: 5.9,
    salesTax: 8.25,
    fees: 500,
    rebates: 0,
    gapInsurance: 0,
    extendedWarranty: 0,
    accessories: 0
  });
  const [calculations, setCalculations] = useState<Calculations>({
    loanAmount: 0,
    monthlyPayment: 0,
    totalInterest: 0,
    totalCost: 0,
    totalDue: 0
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  useEffect(() => {
    if (selectedVehicle) {
      setDealData(prev => ({
        ...prev,
        vehiclePrice: selectedVehicle.price
      }));
    }
  }, [selectedVehicle]);

  useEffect(() => {
    calculatePayment();
  }, [dealData]);

  const calculatePayment = () => {
    const {
      vehiclePrice,
      downPayment,
      tradeInValue,
      loanTerm,
      interestRate,
      salesTax,
      fees,
      rebates,
      gapInsurance,
      extendedWarranty,
      accessories
    } = dealData;

    const taxableAmount = vehiclePrice + accessories + fees;
    const taxAmount = (taxableAmount * salesTax) / 100;
    const totalCost = vehiclePrice + accessories + fees + taxAmount + gapInsurance + extendedWarranty - rebates;
    const totalDue = totalCost - downPayment - tradeInValue;
    const loanAmount = totalDue;

    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = monthlyRate > 0 
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
      : loanAmount / loanTerm;

    const totalInterest = (monthlyPayment * loanTerm) - loanAmount;

    setCalculations({
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalCost,
      totalDue
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSelect(false);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleSelect(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Professional Deal Desk</h1>
          <p className="text-sm md:text-base text-gray-600">Complete deal structuring and financing calculator</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Save className="h-4 w-4 mr-2" />
            Save Deal
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" className="flex-1 md:flex-none">
            <Send className="h-4 w-4 mr-2" />
            Send Quote
          </Button>
        </div>
      </div>

      {/* Customer and Vehicle Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Customer Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Customer</CardTitle>
            <CardDescription className="text-sm">Select or search for a customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCustomer ? (
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm">{selectedCustomer.name}</span>
                  </div>
                  <Badge className={getStatusColor(selectedCustomer.status)}>
                    {selectedCustomer.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedCustomer.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedCustomer.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedCustomer.city}, {selectedCustomer.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Credit Score: {selectedCustomer.creditScore}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border-2 border-dashed rounded-lg text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">No customer selected</p>
              </div>
            )}
            <Dialog open={showCustomerSelect} onOpenChange={setShowCustomerSelect}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedCustomer ? 'Change Customer' : 'Select Customer'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{customer.name}</div>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{customer.phone}</div>
                        <div>{customer.email}</div>
                        <div>Credit Score: {customer.creditScore}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Vehicle</CardTitle>
            <CardDescription className="text-sm">Select vehicle for this deal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedVehicle ? (
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                  </div>
                  <Badge className={getVehicleStatusColor(selectedVehicle.status)}>
                    {selectedVehicle.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    VIN: {selectedVehicle.vin}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Price: ${selectedVehicle.price.toLocaleString()}
                  </div>
                  <div className="text-xs">{selectedVehicle.description}</div>
                </div>
              </div>
            ) : (
              <div className="p-3 border-2 border-dashed rounded-lg text-center">
                <Car className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">No vehicle selected</p>
              </div>
            )}
            <Dialog open={showVehicleSelect} onOpenChange={setShowVehicleSelect}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedVehicle ? 'Change Vehicle' : 'Select Vehicle'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Vehicle</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                        <Badge className={getVehicleStatusColor(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>VIN: {vehicle.vin}</div>
                        <div>Price: ${vehicle.price.toLocaleString()}</div>
                        <div>{vehicle.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Deal Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Deal Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 text-xs md:text-sm">
              <TabsTrigger value="calculator" className="flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                <span className="hidden sm:inline">Calculator</span>
              </TabsTrigger>
              <TabsTrigger value="financing" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span className="hidden sm:inline">Financing</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="approval" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Approval</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Deal Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="vehiclePrice" className="text-xs">Vehicle Price</Label>
                        <Input
                          id="vehiclePrice"
                          type="number"
                          value={dealData.vehiclePrice}
                          onChange={(e) => setDealData({...dealData, vehiclePrice: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="downPayment" className="text-xs">Down Payment</Label>
                        <Input
                          id="downPayment"
                          type="number"
                          value={dealData.downPayment}
                          onChange={(e) => setDealData({...dealData, downPayment: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tradeInValue" className="text-xs">Trade-in Value</Label>
                        <Input
                          id="tradeInValue"
                          type="number"
                          value={dealData.tradeInValue}
                          onChange={(e) => setDealData({...dealData, tradeInValue: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loanTerm" className="text-xs">Loan Term (months)</Label>
                        <Select value={dealData.loanTerm.toString()} onValueChange={(value) => setDealData({...dealData, loanTerm: parseInt(value)})}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
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
                      <div>
                        <Label htmlFor="interestRate" className="text-xs">Interest Rate (%)</Label>
                        <Input
                          id="interestRate"
                          type="number"
                          step="0.1"
                          value={dealData.interestRate}
                          onChange={(e) => setDealData({...dealData, interestRate: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salesTax" className="text-xs">Sales Tax (%)</Label>
                        <Input
                          id="salesTax"
                          type="number"
                          step="0.1"
                          value={dealData.salesTax}
                          onChange={(e) => setDealData({...dealData, salesTax: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="fees" className="text-xs">Fees</Label>
                        <Input
                          id="fees"
                          type="number"
                          value={dealData.fees}
                          onChange={(e) => setDealData({...dealData, fees: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rebates" className="text-xs">Rebates</Label>
                        <Input
                          id="rebates"
                          type="number"
                          value={dealData.rebates}
                          onChange={(e) => setDealData({...dealData, rebates: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gapInsurance" className="text-xs">GAP Insurance</Label>
                        <Input
                          id="gapInsurance"
                          type="number"
                          value={dealData.gapInsurance}
                          onChange={(e) => setDealData({...dealData, gapInsurance: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="extendedWarranty" className="text-xs">Extended Warranty</Label>
                        <Input
                          id="extendedWarranty"
                          type="number"
                          value={dealData.extendedWarranty}
                          onChange={(e) => setDealData({...dealData, extendedWarranty: parseFloat(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Payment Calculations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold text-blue-600">
                            ${calculations.monthlyPayment.toFixed(2)}
                          </div>
                          <div className="text-sm text-blue-600">Monthly Payment</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold">${calculations.loanAmount.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">Loan Amount</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold">${calculations.totalCost.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">Total Cost</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold">${calculations.totalInterest.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">Total Interest</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold">${calculations.totalDue.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">Amount Due</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financing Tab */}
            <TabsContent value="financing" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Financing Options</CardTitle>
                  <CardDescription>Compare different financing scenarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Financing Calculator</h3>
                    <p className="text-gray-600">Advanced financing options coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Products</CardTitle>
                  <CardDescription>Extended warranties, protection plans, and accessories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Product Catalog</h3>
                    <p className="text-gray-600">Additional products and services coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deal Documents</CardTitle>
                  <CardDescription>Generate and manage deal paperwork</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Document Generator</h3>
                    <p className="text-gray-600">Document generation coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approval Tab */}
            <TabsContent value="approval" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deal Approval</CardTitle>
                  <CardDescription>Submit deal for manager approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Approval Workflow</h3>
                    <p className="text-gray-600">Approval system coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deal History</CardTitle>
                  <CardDescription>View deal modifications and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
                    <p className="text-gray-600">Deal history tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}