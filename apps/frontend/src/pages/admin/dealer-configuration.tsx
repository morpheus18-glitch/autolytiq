import { useState } from "react";
import { PageHeader } from "@repo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Clock, 
  Users, 
  DollarSign, 
  Receipt, 
  Car, 
  Wrench, 
  Package, 
  UserCog, 
  Target,
  AlertCircle,
  Settings,
  Save,
  Plus,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DealerConfiguration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your dealership configuration has been updated successfully.",
    });
  };

  return (
    <div>
      <PageHeader
        icon={<Settings className="h-6 w-6" />}
        title="Dealer Configuration"
        description="Comprehensive dealership settings for all operations"
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 h-auto bg-transparent">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Leads</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Service</span>
          </TabsTrigger>
          <TabsTrigger value="parts" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Parts</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dealership Information
              </CardTitle>
              <CardDescription>Basic dealership details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer-name">Dealership Name</Label>
                  <Input id="dealer-name" placeholder="AutolytiQ Motors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-code">Store Code</Label>
                  <Input id="dealer-code" placeholder="STORE001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-license">Dealer License</Label>
                  <Input id="dealer-license" placeholder="DLR-12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="america_new_york">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_new_york">Eastern Time</SelectItem>
                      <SelectItem value="america_chicago">Central Time</SelectItem>
                      <SelectItem value="america_denver">Mountain Time</SelectItem>
                      <SelectItem value="america_los_angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="sales@autolytiq.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Textarea id="address" placeholder="123 Main St, City, State, ZIP" rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>Set your dealership operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center gap-4 border-b pb-3 last:border-0">
                  <div className="w-24 font-medium">{day}</div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={day !== 'Sunday'} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Open</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Input type="time" defaultValue="09:00" className="w-32" />
                    <span>to</span>
                    <Input type="time" defaultValue="18:00" className="w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Management Tab */}
        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lead Response Settings
              </CardTitle>
              <CardDescription>Configure lead handling and response times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-time">Target Response Time (minutes)</Label>
                  <Input id="response-time" type="number" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-leads">Max Leads Per Sales Person</Label>
                  <Input id="max-leads" type="number" defaultValue="20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-priority">Default Lead Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="lead-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto-assign">Auto-Assignment Method</Label>
                  <Select defaultValue="round_robin">
                    <SelectTrigger id="auto-assign">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="availability">By Availability</SelectItem>
                      <SelectItem value="performance">By Performance</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Respond to Web Leads</Label>
                    <p className="text-sm text-gray-500">Send automated response to new web leads</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Follow-Up</Label>
                    <p className="text-sm text-gray-500">Send SMS follow-up after initial contact</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Scoring</Label>
                    <p className="text-sm text-gray-500">Enable AI-powered lead scoring</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Distribution Hours</CardTitle>
              <CardDescription>When leads should be automatically distributed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dist-start">Distribution Start Time</Label>
                  <Input id="dist-start" type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dist-end">Distribution End Time</Label>
                  <Input id="dist-end" type="time" defaultValue="20:00" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Weekend Distribution</Label>
                  <p className="text-sm text-gray-500">Distribute leads on weekends</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance & Products Tab */}
        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Default Finance Settings
              </CardTitle>
              <CardDescription>Configure default finance terms and products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-apr">Default APR (%)</Label>
                  <Input id="default-apr" type="number" step="0.001" defaultValue="6.990" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-term">Default Term (months)</Label>
                  <Select defaultValue="72">
                    <SelectTrigger id="default-term">
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
                <div className="space-y-2">
                  <Label htmlFor="min-down">Min Down Payment (%)</Label>
                  <Input id="min-down" type="number" step="0.1" defaultValue="10.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-ltv">Max LTV (%)</Label>
                  <Input id="max-ltv" type="number" step="0.1" defaultValue="125.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reserve-percent">Finance Reserve (%)</Label>
                  <Input id="reserve-percent" type="number" step="0.1" defaultValue="2.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-fee">Documentation Fee ($)</Label>
                  <Input id="doc-fee" type="number" defaultValue="699" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approved Lenders</CardTitle>
                  <CardDescription>Manage your dealership's approved lender network</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lender
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['First National Bank', 'AutoFinance Plus', 'Regional Credit Union', 'Express Lending'].map((lender, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked={idx < 3} />
                      <div>
                        <p className="font-medium">{lender}</p>
                        <p className="text-sm text-gray-500">Tier A-D | 3.99% - 12.99% APR</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backend Product Presets</CardTitle>
                  <CardDescription>Default warranty, GAP, and maintenance products</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Product Type</Label>
                    <p className="font-medium">Extended Warranty</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Retail Price</Label>
                    <p className="font-medium">$2,495</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Cost</Label>
                    <p className="font-medium">$1,200</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Profit</Label>
                    <p className="font-medium text-green-600">$1,295</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Product Type</Label>
                    <p className="font-medium">GAP Insurance</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Retail Price</Label>
                    <p className="font-medium">$895</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Cost</Label>
                    <p className="font-medium">$350</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Profit</Label>
                    <p className="font-medium text-green-600">$545</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Configuration Tab */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Tax Settings
              </CardTitle>
              <CardDescription>Configure jurisdiction-based tax calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-tax">Default Sales Tax Rate (%)</Label>
                  <Input id="default-tax" type="number" step="0.001" defaultValue="7.250" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-jurisdiction">Default Jurisdiction</Label>
                  <Select defaultValue="state">
                    <SelectTrigger id="tax-jurisdiction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="state">State Only</SelectItem>
                      <SelectItem value="county">State + County</SelectItem>
                      <SelectItem value="city">State + County + City</SelectItem>
                      <SelectItem value="zip">ZIP-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tax on Trade Difference</Label>
                    <p className="text-sm text-gray-500">Apply tax credit for trade-in value</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tax Backend Products</Label>
                    <p className="text-sm text-gray-500">Include warranty/GAP in taxable amount</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Round Tax Calculation</Label>
                    <p className="text-sm text-gray-500">Round tax to nearest cent</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DMV Fees & Registration</CardTitle>
              <CardDescription>State and local DMV fee structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title-fee">Title Fee ($)</Label>
                  <Input id="title-fee" type="number" defaultValue="75" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-fee">Registration Fee ($)</Label>
                  <Input id="reg-fee" type="number" defaultValue="150" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate-fee">License Plate Fee ($)</Label>
                  <Input id="plate-fee" type="number" defaultValue="25" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="efiling-fee">Electronic Filing Fee ($)</Label>
                  <Input id="efiling-fee" type="number" defaultValue="10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                User Roles & Permissions
              </CardTitle>
              <CardDescription>Configure access levels and role permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { role: 'Sales Manager', count: 2, color: 'bg-blue-500' },
                  { role: 'Sales Consultant', count: 8, color: 'bg-green-500' },
                  { role: 'Finance Manager', count: 3, color: 'bg-purple-500' },
                  { role: 'Service Manager', count: 2, color: 'bg-orange-500' },
                  { role: 'Administrator', count: 1, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <div>
                        <p className="font-medium">{item.role}</p>
                        <p className="text-sm text-gray-500">{item.count} users</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit Permissions</Button>
                  </div>
                ))}
              </div>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create New Role
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Control Settings</CardTitle>
              <CardDescription>Security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-gray-500">Auto-logout after 30 minutes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Restrictions</Label>
                  <p className="text-sm text-gray-500">Limit access to office IP addresses</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Inventory Management Settings
              </CardTitle>
              <CardDescription>Configure inventory pricing and aging rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-margin">Minimum Profit Margin (%)</Label>
                  <Input id="min-margin" type="number" step="0.1" defaultValue="8.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age-threshold">Age Threshold (days)</Label>
                  <Input id="age-threshold" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-strategy">Pricing Strategy</Label>
                  <Select defaultValue="market">
                    <SelectTrigger id="price-strategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Based</SelectItem>
                      <SelectItem value="cost_plus">Cost Plus</SelectItem>
                      <SelectItem value="ml_pricing">ML Pricing</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recon-budget">Avg Recon Budget ($)</Label>
                  <Input id="recon-budget" type="number" defaultValue="1500" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Price Adjustments</Label>
                    <p className="text-sm text-gray-500">Automatically adjust prices based on market</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Age-Based Discounts</Label>
                    <p className="text-sm text-gray-500">Reduce price as inventory ages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>VIN Auto-Decode</Label>
                    <p className="text-sm text-gray-500">Automatically decode VIN on entry</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photography & Merchandising</CardTitle>
              <CardDescription>Standards for vehicle presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-photos">Minimum Photos Required</Label>
                  <Input id="min-photos" type="number" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo-quality">Photo Quality</Label>
                  <Select defaultValue="high">
                    <SelectTrigger id="photo-quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Settings Tab */}
        <TabsContent value="service" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Department Settings
              </CardTitle>
              <CardDescription>Configure service operations and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labor-rate">Labor Rate ($/hour)</Label>
                  <Input id="labor-rate" type="number" step="0.01" defaultValue="125.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-supplies">Shop Supplies Fee (%)</Label>
                  <Input id="shop-supplies" type="number" step="0.1" defaultValue="5.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-rate">Warranty Labor Rate ($/hour)</Label>
                  <Input id="warranty-rate" type="number" step="0.01" defaultValue="95.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-buffer">Appointment Buffer (minutes)</Label>
                  <Input id="appointment-buffer" type="number" defaultValue="15" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Online Scheduling</Label>
                    <p className="text-sm text-gray-500">Allow customers to book online</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Service Reminders</Label>
                    <p className="text-sm text-gray-500">Send service reminder texts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Hours</CardTitle>
              <CardDescription>Service department operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Monday-Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32 font-medium">{day}</div>
                  <div className="flex items-center gap-2 flex-1">
                    <Input type="time" defaultValue={day === 'Sunday' ? '' : '07:00'} className="w-32" disabled={day === 'Sunday'} />
                    <span>to</span>
                    <Input type="time" defaultValue={day === 'Sunday' ? '' : '17:00'} className="w-32" disabled={day === 'Sunday'} />
                  </div>
                  <Switch defaultChecked={day !== 'Sunday'} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parts Settings Tab */}
        <TabsContent value="parts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Department Settings
              </CardTitle>
              <CardDescription>Configure parts inventory and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parts-markup">Standard Parts Markup (%)</Label>
                  <Input id="parts-markup" type="number" step="0.1" defaultValue="40.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="core-charge">Average Core Charge ($)</Label>
                  <Input id="core-charge" type="number" step="0.01" defaultValue="50.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-stock">Minimum Stock Alert Threshold</Label>
                  <Input id="min-stock" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder-point">Auto-Reorder Point</Label>
                  <Input id="reorder-point" type="number" defaultValue="3" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Order from Suppliers</Label>
                    <p className="text-sm text-gray-500">Automatically reorder low stock items</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Counter Sales</Label>
                    <p className="text-sm text-gray-500">Allow walk-in parts sales</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Parts Special Orders</Label>
                    <p className="text-sm text-gray-500">Accept special order requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>Primary parts suppliers and vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['OEM Parts Direct', 'AutoZone Commercial', 'NAPA Auto Parts', 'Genuine Parts Co'].map((vendor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked={idx < 2} />
                      <div>
                        <p className="font-medium">{vendor}</p>
                        <p className="text-sm text-gray-500">Primary supplier</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button - Fixed at bottom on mobile */}
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-4 -mx-4 sm:-mx-6 lg:-mx-8 mt-6">
        <div className="max-w-7xl mx-auto flex gap-3">
          <Button 
            onClick={handleSave}
            className="flex-1 gap-2"
            data-testid="button-save-configuration"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
          <Button variant="outline" className="flex-1">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
