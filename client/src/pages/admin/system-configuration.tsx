import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Building2,
  Shield,
  CreditCard,
  Users,
  MessageSquare,
  Bell,
  Plus,
  Edit,
  Trash2,
  Globe,
  Database,
  Key,
  FileText,
  DollarSign,
  Brain,
  Target,
  Workflow
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type {
  FiProduct,
  InsertFiProduct,
} from "@shared/schema";

interface Lender {
  id: number;
  name: string;
  type: 'bank' | 'credit_union' | 'captive' | 'independent';
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  requirements: {
    minCreditScore: number;
    maxLoanAmount: number;
    minLoanAmount: number;
    maxLTV: number;
    dealerNet: boolean;
  };
  products: string[];
  isActive: boolean;
}

export default function SystemConfiguration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("dealership");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FiProduct | null>(null);

  // Fetch F&I products
  const { data: fiProducts = [], isLoading: loadingProducts } = useQuery<FiProduct[]>({
    queryKey: ["/api/fi/products"],
  });

  // Mock lenders data
  const lenders: Lender[] = [
    {
      id: 1,
      name: "First National Bank",
      type: "bank",
      contactInfo: {
        phone: "(555) 123-4567",
        email: "dealers@fnb.com",
        address: "123 Banking St, Financial City, FC 12345"
      },
      requirements: {
        minCreditScore: 600,
        maxLoanAmount: 80000,
        minLoanAmount: 5000,
        maxLTV: 120,
        dealerNet: true
      },
      products: ["Auto Loans", "Lease Financing"],
      isActive: true
    }
  ];

  // Create F&I product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: InsertFiProduct) => apiRequest("/api/fi/products", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fi/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "F&I product created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating product", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateProduct = (formData: FormData) => {
    const data: InsertFiProduct = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      provider: formData.get('provider') as string,
      description: formData.get('description') as string,
      margin: formData.get('margin') as string,
      isActive: formData.get('isActive') === 'true',
      costStructure: {
        basePrice: parseFloat(formData.get('basePrice') as string || '0'),
        markup: parseFloat(formData.get('markup') as string || '0'),
        type: formData.get('costType') as string
      },
      retailPricing: {
        minPrice: parseFloat(formData.get('minPrice') as string || '0'),
        maxPrice: parseFloat(formData.get('maxPrice') as string || '0'),
        recommended: parseFloat(formData.get('recommendedPrice') as string || '0')
      },
      eligibilityCriteria: {
        vehicleAge: parseInt(formData.get('vehicleAge') as string || '0'),
        mileage: parseInt(formData.get('mileage') as string || '0'),
        minCreditScore: parseInt(formData.get('minCreditScore') as string || '0')
      },
      termOptions: {
        months: (formData.get('termMonths') as string || '').split(',').map(t => parseInt(t.trim())).filter(Boolean),
        coverage: formData.get('coverage') as string
      }
    };

    createProductMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-6 w-6 text-blue-600" />
            System Configuration Center
          </CardTitle>
          <CardDescription>
            Comprehensive configuration management for all system settings, integrations, and business rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dealership">Dealership</TabsTrigger>
              <TabsTrigger value="fi-products">F&I Products</TabsTrigger>
              <TabsTrigger value="lenders">Lenders</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Dealership Information Tab */}
            <TabsContent value="dealership" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Dealership Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="dealershipName">Dealership Name</Label>
                      <Input id="dealershipName" defaultValue="AutolytiQ Motors" />
                    </div>
                    <div>
                      <Label htmlFor="dealerNumber">Dealer Number</Label>
                      <Input id="dealerNumber" defaultValue="D12345" />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" defaultValue="123 Auto Way, Car City, CC 12345" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue="(555) 123-4567" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="info@autolytiq.com" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="defaultRole">Default User Role</Label>
                      <Select defaultValue="salesperson">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Sales Manager</SelectItem>
                          <SelectItem value="salesperson">Sales Person</SelectItem>
                          <SelectItem value="fi-manager">F&I Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" defaultValue="60" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="requireMFA" defaultChecked />
                      <Label htmlFor="requireMFA">Require Multi-Factor Authentication</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auditTrail" defaultChecked />
                      <Label htmlFor="auditTrail">Enable Audit Trail</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Business Rules & Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxDiscount">Max Discount %</Label>
                    <Input id="maxDiscount" type="number" defaultValue="15" />
                  </div>
                  <div>
                    <Label htmlFor="leadTimeout">Lead Timeout (hours)</Label>
                    <Input id="leadTimeout" type="number" defaultValue="24" />
                  </div>
                  <div>
                    <Label htmlFor="inventoryAlert">Low Inventory Alert</Label>
                    <Input id="inventoryAlert" type="number" defaultValue="5" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* F&I Products Tab */}
            <TabsContent value="fi-products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">F&I Product Catalog</h3>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add F&I Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New F&I Product</DialogTitle>
                      <DialogDescription>
                        Configure a new finance and insurance product for your dealership
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      handleCreateProduct(formData);
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" name="name" required />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warranty">Extended Warranty</SelectItem>
                                <SelectItem value="gap">GAP Insurance</SelectItem>
                                <SelectItem value="service_contract">Service Contract</SelectItem>
                                <SelectItem value="credit_life">Credit Life Insurance</SelectItem>
                                <SelectItem value="credit_disability">Credit Disability</SelectItem>
                                <SelectItem value="theft_protection">Theft Protection</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="provider">Provider</Label>
                            <Input id="provider" name="provider" required />
                          </div>
                          <div>
                            <Label htmlFor="margin">Markup %</Label>
                            <Input id="margin" name="margin" type="number" step="0.01" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={3} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsProductDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProductMutation.isPending}>
                          Create Product
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fiProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {product.name}
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="capitalize">{product.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Provider:</span>
                          <span className="text-sm font-medium">{product.provider}</span>
                        </div>
                        {product.margin && (
                          <div className="flex justify-between">
                            <span className="text-sm">Margin:</span>
                            <span className="text-sm font-medium">{product.margin}%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {fiProducts.length === 0 && (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">No F&I products configured yet</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Lenders Tab */}
            <TabsContent value="lenders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lender Management</h3>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lender
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lender Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Min Credit</TableHead>
                      <TableHead>Max Loan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lenders.map((lender) => (
                      <TableRow key={lender.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lender.name}</p>
                            <p className="text-sm text-gray-600">{lender.contactInfo.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          <Badge variant="outline">{lender.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{lender.requirements.minCreditScore}</TableCell>
                        <TableCell>${lender.requirements.maxLoanAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={lender.isActive ? "default" : "secondary"}>
                            {lender.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credit Bureau Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {['Experian', 'Equifax', 'TransUnion'].map((bureau) => (
                      <div key={bureau} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{bureau}</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Email Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input id="smtpHost" defaultValue="smtp.sendgrid.net" />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input id="smtpPort" type="number" defaultValue="587" />
                    </div>
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input id="fromEmail" type="email" defaultValue="noreply@autolytiq.com" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableSMS" />
                      <Label htmlFor="enableSMS">Enable SMS Notifications</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="newLeadAlert" defaultChecked />
                      <Label htmlFor="newLeadAlert">New Lead Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="dealAlert" defaultChecked />
                      <Label htmlFor="dealAlert">Deal Status Changes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="inventoryAlert" />
                      <Label htmlFor="inventoryAlert">Low Inventory Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="systemAlert" defaultChecked />
                      <Label htmlFor="systemAlert">System Maintenance</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI & ML Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="pricingModel">Pricing Model</Label>
                      <Select defaultValue="xgboost">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xgboost">XGBoost</SelectItem>
                          <SelectItem value="random_forest">Random Forest</SelectItem>
                          <SelectItem value="linear_regression">Linear Regression</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="retrainingFreq">Retraining Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="autoScraping" defaultChecked />
                      <Label htmlFor="autoScraping">Auto Competitive Scraping</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      API Integrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="googleMaps">Google Maps API</Label>
                      <Input id="googleMaps" type="password" placeholder="API Key" />
                    </div>
                    <div>
                      <Label htmlFor="vehicleData">Vehicle Data API</Label>
                      <Input id="vehicleData" type="password" placeholder="API Key" />
                    </div>
                    <div>
                      <Label htmlFor="creditAPI">Credit API</Label>
                      <Input id="creditAPI" type="password" placeholder="API Key" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database & Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="backupFreq">Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cacheTimeout">Cache Timeout (minutes)</Label>
                      <Input id="cacheTimeout" type="number" defaultValue="15" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableLogging" defaultChecked />
                      <Label htmlFor="enableLogging">Enable Debug Logging</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="passwordPolicy">Password Policy</Label>
                      <Select defaultValue="strong">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input id="maxLoginAttempts" type="number" defaultValue="3" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableSSL" defaultChecked />
                      <Label htmlFor="enableSSL">Force SSL/HTTPS</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compliance & Audit
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="gdprCompliance" defaultChecked />
                    <Label htmlFor="gdprCompliance">GDPR Compliance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auditLogging" defaultChecked />
                    <Label htmlFor="auditLogging">Audit Logging</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="dataRetention" />
                    <Label htmlFor="dataRetention">Data Retention Policy</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Configuration Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button className="w-full md:w-auto">
              Save All Configuration Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}