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
  CreditCard,
  Building2,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type {
  CreditPull,
  LenderApplication,
  FiProduct,
  FinanceMenu
} from "@shared/schema";

interface FiDashboardProps {
  className?: string;
}

export default function FiDashboard({ className }: FiDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch F&I data
  const { data: creditPulls = [], isLoading: loadingCreditPulls } = useQuery<CreditPull[]>({
    queryKey: ["/api/fi/credit-pulls"],
  });

  const { data: lenderApplications = [], isLoading: loadingApplications } = useQuery<LenderApplication[]>({
    queryKey: ["/api/fi/lender-applications"],
  });

  const { data: fiProducts = [], isLoading: loadingProducts } = useQuery<FiProduct[]>({
    queryKey: ["/api/fi/products"],
  });

  const { data: financeMenus = [], isLoading: loadingMenus } = useQuery<FinanceMenu[]>({
    queryKey: ["/api/fi/finance-menus"],
  });

  // Create credit pull mutation
  const createCreditPullMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/fi/credit-pulls", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fi/credit-pulls"] });
    }
  });

  // Create lender application mutation
  const createLenderApplicationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/fi/lender-applications", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fi/lender-applications"] });
    }
  });

  // Create F&I product mutation
  const createFiProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/fi/products", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fi/products"] });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "secondary" as const, icon: Clock },
      approved: { variant: "default" as const, icon: CheckCircle },
      rejected: { variant: "destructive" as const, icon: AlertTriangle },
      submitted: { variant: "outline" as const, icon: FileCheck }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const stats = {
    totalCreditPulls: creditPulls.length,
    pendingApplications: lenderApplications.filter((app) => app.status === 'pending').length,
    approvedApplications: lenderApplications.filter((app) => app.status === 'approved').length,
    activeProducts: fiProducts.filter((product) => product.isActive === true).length,
    averageApprovalTime: "2.3 hours",
    conversionRate: "78%"
  };

  if (loadingCreditPulls || loadingApplications || loadingProducts || loadingMenus) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            F&I Operations Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            F&I Operations Dashboard
          </CardTitle>
          <CardDescription>
            Enterprise-grade Finance & Insurance automation and compliance management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Credit Pulls</p>
                    <p className="text-2xl font-bold">{stats.totalCreditPulls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold">{stats.approvedApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Products</p>
                    <p className="text-2xl font-bold">{stats.activeProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Approval Time</p>
                    <p className="text-2xl font-bold">{stats.averageApprovalTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Conversion</p>
                    <p className="text-2xl font-bold">{stats.conversionRate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="credit-pulls">Credit Pulls</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Credit Pulls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {creditPulls.slice(0, 3).map((pull) => (
                        <div key={pull.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Customer ID: {pull.customerId}</p>
                            <p className="text-sm text-gray-600">Score: {pull.creditScore || 'Pending'}</p>
                          </div>
                          {getStatusBadge(pull.status || 'pending')}
                        </div>
                      ))}
                      {creditPulls.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No credit pulls yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lenderApplications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{app.lenderName}</p>
                            <p className="text-sm text-gray-600">Customer: {app.customerId}</p>
                          </div>
                          {getStatusBadge(app.status || 'pending')}
                        </div>
                      ))}
                      {lenderApplications.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No applications yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="credit-pulls" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Credit Pull Management</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Credit Pull
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Credit Pull</DialogTitle>
                      <DialogDescription>
                        Initiate a new credit pull request for a customer
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      createCreditPullMutation.mutate({
                        customerId: parseInt(formData.get('customerId') as string),
                        dealId: formData.get('dealId') as string,
                        firstName: formData.get('firstName') as string,
                        lastName: formData.get('lastName') as string,
                        ssn: formData.get('ssn') as string,
                        dateOfBirth: formData.get('dateOfBirth') as string,
                        bureau: formData.get('bureau') as string,
                        purpose: formData.get('purpose') as string,
                        status: 'pending'
                      });
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" required />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" required />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="ssn">SSN</Label>
                          <Input id="ssn" name="ssn" type="password" required />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                        </div>
                        <div>
                          <Label htmlFor="bureau">Credit Bureau</Label>
                          <Select name="bureau" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bureau" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="experian">Experian</SelectItem>
                              <SelectItem value="equifax">Equifax</SelectItem>
                              <SelectItem value="transunion">TransUnion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Textarea id="purpose" name="purpose" placeholder="Reason for credit pull..." />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={createCreditPullMutation.isPending}>
                          {createCreditPullMutation.isPending ? 'Creating...' : 'Create Credit Pull'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Bureau</TableHead>
                      <TableHead>Credit Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditPulls.map((pull) => (
                      <TableRow key={pull.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">Customer ID: {pull.customerId}</p>
                            <p className="text-sm text-gray-600">Deal: {pull.dealId || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{pull.provider}</TableCell>
                        <TableCell>
                          {pull.creditScore ? (
                            <Badge variant={pull.creditScore > 700 ? "default" : pull.creditScore > 600 ? "secondary" : "destructive"}>
                              {pull.creditScore}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(pull.status || 'pending')}</TableCell>
                        <TableCell>{pull.createdAt ? format(new Date(pull.createdAt), "MMM d, yyyy") : 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lender Applications</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Submit Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Lender Application</DialogTitle>
                      <DialogDescription>
                        Submit a financing application to a lender
                      </DialogDescription>
                    </DialogHeader>
                    {/* Application form would go here */}
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lender</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lenderApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.lenderName}</TableCell>
                        <TableCell>{app.customerId}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{app.interestRate ? `${app.interestRate}%` : 'TBD'}</TableCell>
                        <TableCell>{getStatusBadge(app.status || 'pending')}</TableCell>
                        <TableCell>{app.createdAt ? format(new Date(app.createdAt), "MMM d, yyyy") : 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">F&I Products</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add F&I Product</DialogTitle>
                      <DialogDescription>
                        Configure a new finance and insurance product
                      </DialogDescription>
                    </DialogHeader>
                    {/* Product form would go here */}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fiProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Provider:</span>
                          <span className="text-sm font-medium">{product.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Margin:</span>
                          <span className="text-sm font-medium">{product.margin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Active:</span>
                          <span className="text-sm font-medium">{product.isActive ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Category:</span>
                          <span className="text-sm font-medium">{product.category}</span>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}