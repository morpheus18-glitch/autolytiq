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
  Building2,
  Plus,
  Edit,
  Trash2,
  Settings,
  Shield,
  CreditCard,
  FileCheck,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type {
  FiProduct,
  InsertFiProduct,
  LenderApplication,
  InsertLenderApplication
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
  createdAt: string;
  updatedAt: string;
}

export default function FiConfigurationPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("lenders");
  const [isLenderDialogOpen, setIsLenderDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FiProduct | null>(null);

  // Fetch F&I configuration data
  const { data: fiProducts = [], isLoading: loadingProducts } = useQuery<FiProduct[]>({
    queryKey: ["/api/fi/products"],
  });

  // Mock lenders data (replace with actual API call)
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
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Community Credit Union",
      type: "credit_union",
      contactInfo: {
        phone: "(555) 987-6543",
        email: "auto@communitycu.org",
        address: "456 Union Ave, Credit City, CC 67890"
      },
      requirements: {
        minCreditScore: 650,
        maxLoanAmount: 60000,
        minLoanAmount: 3000,
        maxLTV: 110,
        dealerNet: false
      },
      products: ["Auto Loans", "Personal Loans"],
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
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

  // Update F&I product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FiProduct> }) => 
      apiRequest(`/api/fi/products/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fi/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "F&I product updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating product", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete F&I product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/fi/products/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fi/products"] });
      toast({ title: "F&I product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting product", 
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

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEditProduct = (product: FiProduct) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this F&I product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const getBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  if (loadingProducts) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              F&I Configuration Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-6 w-6 text-blue-600" />
            F&I Configuration Center
          </CardTitle>
          <CardDescription>
            Configure lenders, F&I products, credit bureaus, and system settings for your dealership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="lenders">Lenders</TabsTrigger>
              <TabsTrigger value="products">F&I Products</TabsTrigger>
              <TabsTrigger value="bureaus">Credit Bureaus</TabsTrigger>
              <TabsTrigger value="system">System Settings</TabsTrigger>
            </TabsList>

            {/* Lenders Tab */}
            <TabsContent value="lenders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lender Management</h3>
                <Button 
                  onClick={() => setIsLenderDialogOpen(true)}
                  className="flex items-center gap-2"
                >
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
                          <Badge variant={getBadgeVariant(lender.isActive)}>
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
            </TabsContent>

            {/* F&I Products Tab */}
            <TabsContent value="products" className="space-y-4">
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
                      <DialogTitle>
                        {editingProduct ? 'Edit F&I Product' : 'Create New F&I Product'}
                      </DialogTitle>
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
                            <Input 
                              id="name" 
                              name="name" 
                              defaultValue={editingProduct?.name}
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" defaultValue={editingProduct?.category} required>
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
                            <Input 
                              id="provider" 
                              name="provider" 
                              defaultValue={editingProduct?.provider}
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="margin">Markup %</Label>
                            <Input 
                              id="margin" 
                              name="margin" 
                              type="number" 
                              step="0.01"
                              defaultValue={editingProduct?.margin || ''}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            name="description" 
                            defaultValue={editingProduct?.description || ''}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="basePrice">Base Price</Label>
                            <Input 
                              id="basePrice" 
                              name="basePrice" 
                              type="number" 
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label htmlFor="minPrice">Min Price</Label>
                            <Input 
                              id="minPrice" 
                              name="minPrice" 
                              type="number" 
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxPrice">Max Price</Label>
                            <Input 
                              id="maxPrice" 
                              name="maxPrice" 
                              type="number" 
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="termMonths">Term Options (months, comma-separated)</Label>
                            <Input 
                              id="termMonths" 
                              name="termMonths" 
                              placeholder="12,24,36,48"
                            />
                          </div>
                          <div>
                            <Label htmlFor="isActive">Status</Label>
                            <Select name="isActive" defaultValue={editingProduct?.isActive ? 'true' : 'false'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsProductDialogOpen(false);
                            setEditingProduct(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                          {editingProduct ? 'Update Product' : 'Create Product'}
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
                        <Badge variant={getBadgeVariant(product.isActive || false)}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Provider:</span>
                          <span className="text-sm font-medium">{product.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Category:</span>
                          <span className="text-sm font-medium capitalize">{product.category}</span>
                        </div>
                        {product.margin && (
                          <div className="flex justify-between">
                            <span className="text-sm">Margin:</span>
                            <span className="text-sm font-medium">{product.margin}%</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {fiProducts.length === 0 && (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">No F&I products configured yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Add products like extended warranties, GAP insurance, and service contracts
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Credit Bureaus Tab */}
            <TabsContent value="bureaus" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Credit Bureau Configuration</h3>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Bureau
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {['Experian', 'Equifax', 'TransUnion'].map((bureau) => (
                  <Card key={bureau}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {bureau}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">API Key:</span>
                          <span className="text-sm text-gray-400">Configured</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cost per Pull:</span>
                          <span className="text-sm font-medium">$12.50</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-4">
              <h3 className="text-lg font-semibold">F&I System Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="dealerNumber">Dealer Number</Label>
                      <Input id="dealerNumber" defaultValue="D12345" />
                    </div>
                    <div>
                      <Label htmlFor="fiManager">F&I Manager Default</Label>
                      <Select defaultValue="manager1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager1">John Smith</SelectItem>
                          <SelectItem value="manager2">Jane Doe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxFinanceAmount">Max Finance Amount</Label>
                      <Input id="maxFinanceAmount" type="number" defaultValue="100000" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="requireDisclosures" defaultChecked />
                      <Label htmlFor="requireDisclosures">Require All Disclosures</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auditTrail" defaultChecked />
                      <Label htmlFor="auditTrail">Enable Audit Trail</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="electronicSignatures" defaultChecked />
                      <Label htmlFor="electronicSignatures">Allow E-Signatures</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}