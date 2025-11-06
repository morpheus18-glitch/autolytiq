import { useState } from "react";
import { 
  PageContainer, 
  PageHeader, 
  ResponsiveGrid, 
  ResponsiveButton, 
  ResponsiveActions,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Download, Upload, BookOpen, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

const accountCategories = [
  { id: "assets", name: "Assets", color: "bg-[rgb(var(--success)_/_0.15)] text-[rgb(var(--success))]", count: 15 },
  { id: "liabilities", name: "Liabilities", color: "bg-[rgb(var(--error)_/_0.15)] text-[rgb(var(--error))]", count: 8 },
  { id: "equity", name: "Equity", color: "bg-[rgb(var(--action-primary)_/_0.15)] text-[rgb(var(--action-primary))]", count: 5 },
  { id: "revenue", name: "Revenue", color: "bg-[rgb(var(--accent-primary)_/_0.15)] text-[rgb(var(--accent-primary))]", count: 12 },
  { id: "expenses", name: "Expenses", color: "bg-[rgb(var(--warning)_/_0.15)] text-[rgb(var(--warning))]", count: 22 }
];

const sampleAccounts = [
  { id: "1000", name: "Cash - Operating", category: "Assets", type: "Current Asset", balance: 125000, status: "Active", lastModified: "2024-01-15" },
  { id: "1200", name: "Accounts Receivable", category: "Assets", type: "Current Asset", balance: 89500, status: "Active", lastModified: "2024-01-14" },
  { id: "1300", name: "Vehicle Inventory", category: "Assets", type: "Inventory", balance: 2100000, status: "Active", lastModified: "2024-01-13" },
  { id: "1400", name: "Parts Inventory", category: "Assets", type: "Inventory", balance: 185000, status: "Active", lastModified: "2024-01-12" },
  { id: "1500", name: "Office Equipment", category: "Assets", type: "Fixed Asset", balance: 45000, status: "Active", lastModified: "2024-01-11" },
  { id: "2000", name: "Accounts Payable", category: "Liabilities", type: "Current Liability", balance: -125000, status: "Active", lastModified: "2024-01-10" },
  { id: "2100", name: "Floor Plan Payable", category: "Liabilities", type: "Current Liability", balance: -1950000, status: "Active", lastModified: "2024-01-09" },
  { id: "3000", name: "Owner's Equity", category: "Equity", type: "Equity", balance: 500000, status: "Active", lastModified: "2024-01-08" },
  { id: "4000", name: "Vehicle Sales", category: "Revenue", type: "Sales Revenue", balance: 125000, status: "Active", lastModified: "2024-01-07" },
  { id: "4100", name: "Service Revenue", category: "Revenue", type: "Service Revenue", balance: 35000, status: "Active", lastModified: "2024-01-06" },
  { id: "4200", name: "Parts Revenue", category: "Revenue", type: "Parts Revenue", balance: 22000, status: "Active", lastModified: "2024-01-05" },
  { id: "5000", name: "Cost of Goods Sold", category: "Expenses", type: "COGS", balance: -95000, status: "Active", lastModified: "2024-01-04" },
  { id: "6000", name: "Salaries & Wages", category: "Expenses", type: "Operating Expense", balance: -45000, status: "Active", lastModified: "2024-01-03" },
  { id: "6100", name: "Rent Expense", category: "Expenses", type: "Operating Expense", balance: -12000, status: "Active", lastModified: "2024-01-02" },
  { id: "6200", name: "Utilities", category: "Expenses", type: "Operating Expense", balance: -3500, status: "Active", lastModified: "2024-01-01" }
];

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const filteredAccounts = sampleAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.id.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || account.category === selectedCategory;
    const matchesType = selectedType === "all" || account.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getCategoryColor = (category: string) => {
    const cat = accountCategories.find(c => c.name === category);
    return cat?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <PageContainer>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your dealership's financial account structure"
        icon={<BookOpen className="h-6 w-6" />}
        actions={
          <ResponsiveActions>
            <ResponsiveButton icon={<Upload className="h-4 w-4" />} text="Import" variant="outline" />
            <ResponsiveButton icon={<Download className="h-4 w-4" />} text="Export" variant="outline" />
            <ResponsiveButton icon={<Plus className="h-4 w-4" />} text="Add Account" />
          </ResponsiveActions>
        }
      />

      {/* Summary Cards */}
      <ResponsiveGrid cols={5} mobileCols={2} gap="md">
        {accountCategories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={category.color}>{category.name}</Badge>
                  <p className="text-2xl font-bold mt-2 text-text-primary">{category.count}</p>
                  <p className="text-sm text-text-secondary">Accounts</p>
                </div>
                <BookOpen className="h-8 w-8 text-text-tertiary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">All Accounts</TabsTrigger>
          <TabsTrigger value="mapping">Account Mapping</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
                    <Input
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {accountCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Current Asset">Current Asset</SelectItem>
                    <SelectItem value="Fixed Asset">Fixed Asset</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Current Liability">Current Liability</SelectItem>
                    <SelectItem value="Long-term Liability">Long-term Liability</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Sales Revenue">Sales Revenue</SelectItem>
                    <SelectItem value="Service Revenue">Service Revenue</SelectItem>
                    <SelectItem value="Parts Revenue">Parts Revenue</SelectItem>
                    <SelectItem value="COGS">Cost of Goods Sold</SelectItem>
                    <SelectItem value="Operating Expense">Operating Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account #</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium text-text-primary">{account.id}</TableCell>
                      <TableCell className="text-text-primary">{account.name}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(account.category)}>
                          {account.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-text-secondary">{account.type}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        account.balance >= 0 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'
                      }`}>
                        {account.balance >= 0 ? '' : '-'}{formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-text-secondary">{account.lastModified}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">History</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Mapping</CardTitle>
              <CardDescription>
                Map your chart of accounts to external systems and reporting requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveGrid cols={3} mobileCols={1}>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-text-primary">Tax Reporting</h3>
                      <p className="text-sm text-text-secondary mb-4">Map accounts to tax categories</p>
                      <Button size="sm" variant="outline">Configure Mapping</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-text-primary">Financial Statements</h3>
                      <p className="text-sm text-text-secondary mb-4">Organize accounts for reporting</p>
                      <Button size="sm" variant="outline">Configure Mapping</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-text-primary">DMS Integration</h3>
                      <p className="text-sm text-text-secondary mb-4">Sync with dealership systems</p>
                      <Button size="sm" variant="outline">Configure Mapping</Button>
                    </CardContent>
                  </Card>
                </ResponsiveGrid>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts Settings</CardTitle>
              <CardDescription>
                Configure account numbering, defaults, and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Account Numbering</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Assets Range</label>
                      <Input placeholder="1000-1999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Liabilities Range</label>
                      <Input placeholder="2000-2999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Equity Range</label>
                      <Input placeholder="3000-3999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Revenue Range</label>
                      <Input placeholder="4000-4999" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Approval Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Require approval for new accounts</span>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require approval for account modifications</span>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lock accounts after period close</span>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}