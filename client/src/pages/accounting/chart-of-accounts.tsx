import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Edit, DollarSign, FileText, Calculator, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChartOfAccounts() {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    type: "",
    category: "",
    description: "",
    isActive: true
  });
  const [journalEntry, setJournalEntry] = useState({
    description: "",
    entries: [{ accountCode: "", debit: 0, credit: 0, memo: "" }]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: chartOfAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/accounting/chart-of-accounts']
  });

  const { data: accountTypes } = useQuery({
    queryKey: ['/api/accounting/account-types']
  });

  const { data: journalEntries } = useQuery({
    queryKey: ['/api/accounting/journal-entries']
  });

  const { data: trialBalance } = useQuery({
    queryKey: ['/api/accounting/trial-balance']
  });

  const { data: accountDetails } = useQuery({
    queryKey: ['/api/accounting/accounts', selectedAccount?.id],
    enabled: !!selectedAccount?.id
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: async (accountData) => {
      return await apiRequest("POST", "/api/accounting/chart-of-accounts", accountData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/accounting/chart-of-accounts']);
      toast({ title: "Account Created", description: "New account added to chart of accounts" });
      setNewAccount({ code: "", name: "", type: "", category: "", description: "", isActive: true });
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await apiRequest("PATCH", `/api/accounting/chart-of-accounts/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/accounting/chart-of-accounts']);
      toast({ title: "Account Updated" });
    }
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: async (entryData) => {
      return await apiRequest("POST", "/api/accounting/journal-entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/accounting/journal-entries']);
      queryClient.invalidateQueries(['/api/accounting/trial-balance']);
      toast({ title: "Journal Entry Posted" });
      setJournalEntry({
        description: "",
        entries: [{ accountCode: "", debit: 0, credit: 0, memo: "" }]
      });
    }
  });

  // Standard dealership chart of accounts
  const standardAccounts = [
    // Assets (1000-1999)
    { code: "1000", name: "Cash - Operating", type: "Asset", category: "Current Assets" },
    { code: "1010", name: "Cash - Floor Plan", type: "Asset", category: "Current Assets" },
    { code: "1100", name: "Accounts Receivable", type: "Asset", category: "Current Assets" },
    { code: "1110", name: "Finance & Insurance Receivable", type: "Asset", category: "Current Assets" },
    { code: "1200", name: "Vehicle Inventory - New", type: "Asset", category: "Inventory" },
    { code: "1210", name: "Vehicle Inventory - Used", type: "Asset", category: "Inventory" },
    { code: "1300", name: "Parts Inventory", type: "Asset", category: "Inventory" },
    { code: "1400", name: "Prepaid Expenses", type: "Asset", category: "Current Assets" },
    { code: "1500", name: "Equipment", type: "Asset", category: "Fixed Assets" },
    { code: "1510", name: "Accumulated Depreciation - Equipment", type: "Asset", category: "Fixed Assets" },
    
    // Liabilities (2000-2999)
    { code: "2000", name: "Accounts Payable", type: "Liability", category: "Current Liabilities" },
    { code: "2100", name: "Floor Plan Payable - New", type: "Liability", category: "Current Liabilities" },
    { code: "2110", name: "Floor Plan Payable - Used", type: "Liability", category: "Current Liabilities" },
    { code: "2200", name: "Accrued Expenses", type: "Liability", category: "Current Liabilities" },
    { code: "2300", name: "Customer Deposits", type: "Liability", category: "Current Liabilities" },
    { code: "2400", name: "Warranty Reserve", type: "Liability", category: "Current Liabilities" },
    { code: "2500", name: "Long-term Debt", type: "Liability", category: "Long-term Liabilities" },
    
    // Equity (3000-3999)
    { code: "3000", name: "Owner's Capital", type: "Equity", category: "Owner's Equity" },
    { code: "3100", name: "Retained Earnings", type: "Equity", category: "Owner's Equity" },
    { code: "3200", name: "Current Year Earnings", type: "Equity", category: "Owner's Equity" },
    
    // Revenue (4000-4999)
    { code: "4000", name: "New Vehicle Sales", type: "Revenue", category: "Vehicle Sales" },
    { code: "4100", name: "Used Vehicle Sales", type: "Revenue", category: "Vehicle Sales" },
    { code: "4200", name: "Finance & Insurance Income", type: "Revenue", category: "F&I Revenue" },
    { code: "4300", name: "Service Revenue", type: "Revenue", category: "Service Revenue" },
    { code: "4400", name: "Parts Revenue", type: "Revenue", category: "Parts Revenue" },
    { code: "4500", name: "Warranty Income", type: "Revenue", category: "Other Revenue" },
    { code: "4600", name: "Floor Plan Assistance", type: "Revenue", category: "Other Revenue" },
    
    // Expenses (5000-5999)
    { code: "5000", name: "Cost of Goods Sold - New Vehicles", type: "Expense", category: "Cost of Sales" },
    { code: "5100", name: "Cost of Goods Sold - Used Vehicles", type: "Expense", category: "Cost of Sales" },
    { code: "5200", name: "Cost of Goods Sold - Parts", type: "Expense", category: "Cost of Sales" },
    { code: "5300", name: "Salaries & Wages", type: "Expense", category: "Operating Expenses" },
    { code: "5400", name: "Commission Expense", type: "Expense", category: "Operating Expenses" },
    { code: "5500", name: "Floor Plan Interest", type: "Expense", category: "Operating Expenses" },
    { code: "5600", name: "Advertising & Marketing", type: "Expense", category: "Operating Expenses" },
    { code: "5700", name: "Rent Expense", type: "Expense", category: "Operating Expenses" },
    { code: "5800", name: "Utilities", type: "Expense", category: "Operating Expenses" },
    { code: "5900", name: "Insurance", type: "Expense", category: "Operating Expenses" }
  ];

  const handleCreateStandardAccounts = () => {
    standardAccounts.forEach(account => {
      createAccountMutation.mutate({
        ...account,
        description: `Standard dealership ${account.category.toLowerCase()} account`,
        isActive: true
      });
    });
  };

  const addJournalEntryLine = () => {
    setJournalEntry(prev => ({
      ...prev,
      entries: [...prev.entries, { accountCode: "", debit: 0, credit: 0, memo: "" }]
    }));
  };

  const updateJournalEntryLine = (index, field, value) => {
    setJournalEntry(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeJournalEntryLine = (index) => {
    setJournalEntry(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }));
  };

  const calculateJournalTotals = () => {
    const totalDebits = journalEntry.entries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
    const totalCredits = journalEntry.entries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);
    return { totalDebits, totalCredits, difference: totalDebits - totalCredits };
  };

  const journalTotals = calculateJournalTotals();

  const handlePostJournalEntry = () => {
    if (Math.abs(journalTotals.difference) > 0.01) {
      toast({
        title: "Journal Entry Error",
        description: "Debits and credits must be equal",
        variant: "destructive"
      });
      return;
    }

    createJournalEntryMutation.mutate({
      ...journalEntry,
      date: new Date().toISOString(),
      totalAmount: journalTotals.totalDebits
    });
  };

  if (accountsLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your dealership's complete accounting structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCreateStandardAccounts}
            disabled={chartOfAccounts?.length > 0}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Setup Standard Accounts
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Code</Label>
                    <Input
                      value={newAccount.code}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value) => setNewAccount(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asset">Asset</SelectItem>
                        <SelectItem value="Liability">Liability</SelectItem>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Account name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newAccount.category}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Current Assets"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newAccount.description}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Account description"
                  />
                </div>
                <Button 
                  onClick={() => createAccountMutation.mutate(newAccount)}
                  disabled={!newAccount.code || !newAccount.name || !newAccount.type}
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartOfAccounts?.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{account.category}</TableCell>
                      <TableCell>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${account.balance?.toLocaleString() || "0.00"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAccount(account)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Journal Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create Journal Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Input
                    value={journalEntry.description}
                    onChange={(e) => setJournalEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Entry description"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Account Entries</Label>
                    <Button size="sm" variant="outline" onClick={addJournalEntryLine}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {journalEntry.entries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                      <div>
                        <Select
                          value={entry.accountCode}
                          onValueChange={(value) => updateJournalEntryLine(index, 'accountCode', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Account" />
                          </SelectTrigger>
                          <SelectContent>
                            {chartOfAccounts?.map(account => (
                              <SelectItem key={account.id} value={account.code}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Debit"
                          value={entry.debit}
                          onChange={(e) => updateJournalEntryLine(index, 'debit', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Credit"
                          value={entry.credit}
                          onChange={(e) => updateJournalEntryLine(index, 'credit', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Memo"
                          value={entry.memo}
                          onChange={(e) => updateJournalEntryLine(index, 'memo', e.target.value)}
                        />
                      </div>
                      <div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeJournalEntryLine(index)}
                          disabled={journalEntry.entries.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Debits</p>
                      <p className="font-semibold">${journalTotals.totalDebits.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Credits</p>
                      <p className="font-semibold">${journalTotals.totalCredits.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {Math.abs(journalTotals.difference) > 0.01 && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                      Out of balance: ${Math.abs(journalTotals.difference).toFixed(2)}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePostJournalEntry}
                  disabled={Math.abs(journalTotals.difference) > 0.01 || !journalEntry.description}
                  className="w-full"
                >
                  Post Journal Entry
                </Button>
              </CardContent>
            </Card>

            {/* Recent Journal Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Journal Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journalEntries?.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{entry.description}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {entry.entries?.map((line, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{line.accountCode} - {line.accountName}</span>
                            <span>
                              {line.debit > 0 ? `$${line.debit.toLocaleString()}` : `($${line.credit.toLocaleString()})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Trial Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance?.accounts?.map((account) => (
                    <TableRow key={account.code}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {account.debitBalance > 0 ? `$${account.debitBalance.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {account.creditBalance > 0 ? `$${account.creditBalance.toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell colSpan={2}>TOTALS</TableCell>
                    <TableCell className="text-right font-mono">
                      ${trialBalance?.totalDebits?.toLocaleString() || "0.00"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${trialBalance?.totalCredits?.toLocaleString() || "0.00"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Profit and loss for current period
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Balance Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Assets, liabilities, and equity
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cash Flow Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Cash inflows and outflows
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dealership Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Key dealership metrics
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Profit by department
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aging Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Accounts receivable aging
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}