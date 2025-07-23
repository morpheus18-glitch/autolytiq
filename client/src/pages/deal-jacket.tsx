import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User,
  Car,
  FileText,
  CreditCard,
  History,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  ArrowRight,
  Shield,
  Award,
  Briefcase
} from 'lucide-react';

interface DealJacket {
  id: string;
  storeId: string;
  customerId: number;
  dealNumber: string;
  status: string;
  dealType: string;
  salesConsultant: string;
  financeManager: string;
  lastActivity: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  store: {
    id: string;
    name: string;
    code: string;
  };
  dealStructure?: {
    salePrice: number;
    tradeValue: number;
    downPayment: number;
    monthlyPayment: number;
    apr: number;
    termMonths: number;
  };
  creditApplications: Array<{
    id: string;
    applicationType: string;
    firstName: string;
    lastName: string;
    creditScore: number;
    status: string;
    creditDecision: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    documentCategory: string;
    fileName: string;
    status: string;
    uploadedBy: string;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    productType: string;
    productName: string;
    customerPrice: number;
    status: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    description: string;
    performedBy: string;
    timestamp: string;
  }>;
}

export default function DealJacket() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('summary');
  
  // Working state management
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [showCreditApp, setShowCreditApp] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [showCoApplicantDialog, setShowCoApplicantDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [creditAppData, setCreditAppData] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    dateOfBirth: '',
    annualIncome: '',
    employment: '',
    monthlyPayment: '',
    downPayment: ''
  });

  const defaultDealJacket: DealJacket = {
    id: id || '',
    storeId: 'store-001',
    customerId: 1,
    dealNumber: `DEAL-${Date.now()}`,
    status: 'structuring',
    dealType: 'retail',
    salesConsultant: '',
    financeManager: '',
    lastActivity: new Date().toISOString(),
    customer: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567'
    },
    store: {
      id: 'store-001',
      name: 'Main Dealership',
      code: 'MAIN'
    },
    dealStructure: {
      salePrice: 0,
      tradeValue: 0,
      downPayment: 0,
      monthlyPayment: 0,
      apr: 0,
      termMonths: 60
    },
    creditApplications: [],
    documents: [],
    products: [],
    history: []
  };

  const { data: dealJacket = defaultDealJacket, isLoading } = useQuery<DealJacket>({
    queryKey: ['/api/deal-jackets', id],
    enabled: !!id,
  });

  // Fetch vehicles for price auto-population
  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Fetch sales consultants for dropdown
  const { data: salesConsultants = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const updateDealJacket = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest('PATCH', `/api/deal-jackets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deal-jackets', id] });
      toast({
        title: "Deal Updated",
        description: "Deal jacket has been updated successfully.",
      });
    },
  });

  // Create Deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      return apiRequest('POST', '/api/deals', dealData);
    },
    onSuccess: () => {
      toast({
        title: "Deal Created",
        description: "New deal has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Deal",
        description: error.message || "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Credit Application mutation
  const createCreditAppMutation = useMutation({
    mutationFn: async (appData: any) => {
      return apiRequest('POST', `/api/deal-jackets/${id}/credit-applications`, appData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deal-jackets', id] });
      setShowCreditApp(false);
      setCreditAppData({
        firstName: '',
        lastName: '',
        ssn: '',
        dateOfBirth: '',
        annualIncome: '',
        employment: '',
        monthlyPayment: '',
        downPayment: ''
      });
      toast({
        title: "Credit Application Created",
        description: "Credit application submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create credit application.",
        variant: "destructive",
      });
    },
  });

  // Add Note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      return apiRequest('POST', `/api/deal-jackets/${id}/notes`, noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deal-jackets', id] });
      setNewNote('');
      toast({
        title: "Note Added",
        description: "Note has been added successfully.",
      });
    },
  });

  // Working functions
  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      // Auto-populate price
      updateDealJacket.mutate({
        vehicleId: vehicle.id,
        salePrice: vehicle.price
      });
    }
  };

  const handleCreateDeal = () => {
    if (!selectedVehicle || !selectedConsultant) {
      toast({
        title: "Missing Information",
        description: "Please select a vehicle and sales consultant.",
        variant: "destructive",
      });
      return;
    }

    createDealMutation.mutate({
      vehicleId: selectedVehicle.id,
      salesConsultant: selectedConsultant,
      customerId: dealJacket?.customer?.id || 1,
      status: 'in_progress'
    });
  };

  const handleCreditAppSubmit = () => {
    if (!creditAppData.firstName || !creditAppData.lastName || !creditAppData.ssn) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createCreditAppMutation.mutate(creditAppData);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter a note before adding.",
        variant: "destructive",
      });
      return;
    }
    addNoteMutation.mutate({
      content: newNote,
      noteType: 'general'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dealJacket) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Deal jacket not found</h3>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dealJacket.customer?.firstName} {dealJacket.customer?.lastName}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge className={`${getStatusColor(dealJacket.status)} px-3 py-1 rounded-full font-medium`}>
                  {dealJacket.status?.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">Deal #{dealJacket.dealNumber}</span>
                <span className="text-sm text-gray-600">
                  Last Updated: {new Date(dealJacket.lastActivity || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">
                F&I Manager: {dealJacket.financeManager || 'Please Begin Typing'}
              </div>
              <div className="text-gray-600">
                Sales Manager: {dealJacket.salesConsultant || 'Please Begin Typing'}
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <TabsList className="grid grid-cols-6 w-full h-auto p-2">
            <TabsTrigger value="summary" className="flex items-center space-x-2 py-3">
              <FileText className="w-4 h-4" />
              <span>Summary</span>
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center space-x-2 py-3">
              <User className="w-4 h-4" />
              <span>Customer</span>
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center space-x-2 py-3">
              <CreditCard className="w-4 h-4" />
              <span>Credit & Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center space-x-2 py-3">
              <DollarSign className="w-4 h-4" />
              <span>Deal Structure</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2 py-3">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 py-3">
              <History className="w-4 h-4" />
              <span>Deal History</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Applicant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {dealJacket.customer?.firstName} {dealJacket.customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{dealJacket.customer?.email}</p>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Work Number:</span>
                      <span className="font-medium">571,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Number:</span>
                      <span className="font-medium">571,456</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Applications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Credit Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealJacket.creditApplications?.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{app.firstName} {app.lastName}</p>
                          <p className="text-xs text-gray-600">{app.applicationType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${
                          app.creditDecision === 'approved' ? 'bg-green-100 text-green-800' :
                          app.creditDecision === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.creditDecision || 'Pending'}
                        </Badge>
                        {app.creditScore && (
                          <p className="text-xs text-gray-600 mt-1">Score: {app.creditScore}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deal Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Deal Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dealJacket.dealStructure && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sale Price:</span>
                      <span className="font-medium">${dealJacket.dealStructure.salePrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Trade Value:</span>
                      <span className="font-medium">${dealJacket.dealStructure.tradeValue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Down Payment:</span>
                      <span className="font-medium">${dealJacket.dealStructure.downPayment?.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Monthly Payment:</span>
                        <span>${dealJacket.dealStructure.monthlyPayment?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{dealJacket.dealStructure.apr}% APR</span>
                        <span>{dealJacket.dealStructure.termMonths} months</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* F&I Products */}
                {dealJacket.products && dealJacket.products.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">F&I Products</h4>
                    <div className="space-y-1">
                      {dealJacket.products.map((product) => (
                        <div key={product.id} className="flex justify-between text-xs">
                          <span className="text-gray-600">{product.productName}:</span>
                          <span className="font-medium">${product.customerPrice?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Tab */}
        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehicle-select">Select Vehicle</Label>
                  <Select onValueChange={handleVehicleSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedVehicle && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Selected Vehicle</h4>
                    <p className="text-sm text-gray-600">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      ${selectedVehicle.price?.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales Consultant */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Consultant</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="consultant-select">Assign Sales Consultant</Label>
                  <Select onValueChange={setSelectedConsultant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesConsultants?.filter(user => user.role === 'sales_consultant')?.map((consultant) => (
                        <SelectItem key={consultant.id} value={consultant.id}>
                          {consultant.firstName} {consultant.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleCreateDeal} 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  disabled={createDealMutation.isPending}
                >
                  {createDealMutation.isPending ? 'Creating...' : 'Create Deal'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Credit & Compliance Tab */}
        <TabsContent value="credit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Credit Applications</CardTitle>
                <Button onClick={() => setShowCreditApp(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealJacket?.creditApplications?.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{app.firstName} {app.lastName}</p>
                        <p className="text-xs text-gray-600">{app.applicationType}</p>
                      </div>
                      <Badge className={`text-xs ${
                        app.creditDecision === 'approved' ? 'bg-green-100 text-green-800' :
                        app.creditDecision === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.creditDecision || 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trade & Co-applicant */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowTradeDialog(true)}
                >
                  <Car className="w-4 h-4 mr-2" />
                  Add Trade-In
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowCoApplicantDialog(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Add Co-Applicant
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deal Structure Tab */}
        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Showroom Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Time In</Label>
                    <Input type="time" />
                  </div>
                  <div>
                    <Label>Time Out</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <Label>Activities</Label>
                  <Textarea placeholder="Log customer activities..." />
                </div>
                <Button className="w-full">Save Log Entry</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal History Tab with Notes */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleAddNote}
                  disabled={addNoteMutation.isPending || !newNote.trim()}
                >
                  {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </Button>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dealJacket?.history?.filter(h => h.action === 'Note Added')?.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{note.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.timestamp).toLocaleString()} - {note.performedBy}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dealJacket?.history?.map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <History className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{entry.action}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                        <p className="text-xs text-gray-500 mt-2">by {entry.performedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{dealJacket.customer?.firstName} {dealJacket.customer?.lastName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealJacket.documents
                    ?.filter(doc => doc.documentCategory === 'customer')
                    ?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.documentType}</p>
                          <p className="text-xs text-gray-600">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${
                          doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deal Jacket Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Jacket Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealJacket.documents
                    ?.filter(doc => doc.documentCategory === 'deal')
                    ?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.documentType}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString()} - {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${
                          doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deal History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Deal Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealJacket.history?.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <History className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{entry.action}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      <p className="text-xs text-gray-500 mt-2">by {entry.performedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credit Application Dialog */}
      <Dialog open={showCreditApp} onOpenChange={setShowCreditApp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Credit Application</DialogTitle>
            <DialogDescription>
              Complete the secure credit application form
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={creditAppData.firstName}
                onChange={(e) => setCreditAppData({...creditAppData, firstName: e.target.value})}
                placeholder="First name"
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={creditAppData.lastName}
                onChange={(e) => setCreditAppData({...creditAppData, lastName: e.target.value})}
                placeholder="Last name"
              />
            </div>
            <div>
              <Label>SSN *</Label>
              <Input
                value={creditAppData.ssn}
                onChange={(e) => setCreditAppData({...creditAppData, ssn: e.target.value})}
                placeholder="XXX-XX-XXXX"
                type="password"
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                value={creditAppData.dateOfBirth}
                onChange={(e) => setCreditAppData({...creditAppData, dateOfBirth: e.target.value})}
                type="date"
              />
            </div>
            <div>
              <Label>Annual Income</Label>
              <Input
                value={creditAppData.annualIncome}
                onChange={(e) => setCreditAppData({...creditAppData, annualIncome: e.target.value})}
                placeholder="Annual income"
                type="number"
              />
            </div>
            <div>
              <Label>Employment</Label>
              <Input
                value={creditAppData.employment}
                onChange={(e) => setCreditAppData({...creditAppData, employment: e.target.value})}
                placeholder="Employer name"
              />
            </div>
            <div>
              <Label>Desired Monthly Payment</Label>
              <Input
                value={creditAppData.monthlyPayment}
                onChange={(e) => setCreditAppData({...creditAppData, monthlyPayment: e.target.value})}
                placeholder="Monthly payment"
                type="number"
              />
            </div>
            <div>
              <Label>Down Payment</Label>
              <Input
                value={creditAppData.downPayment}
                onChange={(e) => setCreditAppData({...creditAppData, downPayment: e.target.value})}
                placeholder="Down payment"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditApp(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreditAppSubmit}
              disabled={createCreditAppMutation.isPending}
            >
              {createCreditAppMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trade-In Dialog */}
      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trade-In Vehicle</DialogTitle>
            <DialogDescription>
              Enter details about the customer's trade-in vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Year</Label>
                <Input placeholder="2020" />
              </div>
              <div>
                <Label>Make</Label>
                <Input placeholder="Toyota" />
              </div>
              <div>
                <Label>Model</Label>
                <Input placeholder="Camry" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mileage</Label>
                <Input placeholder="50,000" type="number" />
              </div>
              <div>
                <Label>Condition</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Estimated Value</Label>
              <Input placeholder="15,000" type="number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowTradeDialog(false)}>
              Add Trade-In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Co-Applicant Dialog */}
      <Dialog open={showCoApplicantDialog} onOpenChange={setShowCoApplicantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Co-Applicant</DialogTitle>
            <DialogDescription>
              Add a co-applicant to this deal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input placeholder="First name" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input placeholder="Last name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SSN</Label>
                <Input placeholder="XXX-XX-XXXX" type="password" />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Relationship to Primary Applicant</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoApplicantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCoApplicantDialog(false)}>
              Add Co-Applicant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}