import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, DollarSign, Calendar, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  payPeriod: string;
  hoursWorked: number;
  hourlyRate: number;
  overtimeHours: number;
  overtimeRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
  payDate: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  hourlyRate: number;
  salary: number;
  payType: string;
  status: string;
}

export default function PayrollPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payrollRecords = [], isLoading: recordsLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const processPayrollMutation = useMutation({
    mutationFn: async (payrollData: Partial<PayrollRecord>) => {
      return await apiRequest("/api/payroll", {
        method: "POST",
        body: payrollData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({ title: "Payroll processed successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to process payroll", variant: "destructive" });
    },
  });

  const updatePayrollMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<PayrollRecord> }) => {
      return await apiRequest(`/api/payroll/${id}`, {
        method: "PUT",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({ title: "Payroll updated successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update payroll", variant: "destructive" });
    },
  });

  const deletePayrollMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/payroll/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({ title: "Payroll record deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete payroll record", variant: "destructive" });
    },
  });

  const handleEdit = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this payroll record?")) {
      deletePayrollMutation.mutate(id);
    }
  };

  const handleExport = () => {
    toast({ 
      title: "Export Started", 
      description: `Exporting payroll data for ${selectedPeriod} period...` 
    });
  };

  const handleProcessPayroll = () => {
    toast({ 
      title: "Payroll Processing", 
      description: "Processing payroll for all employees..." 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payrollData = {
      employeeId: parseInt(formData.get("employeeId") as string),
      payPeriod: formData.get("payPeriod") as string,
      hoursWorked: parseFloat(formData.get("hoursWorked") as string),
      overtimeHours: parseFloat(formData.get("overtimeHours") as string) || 0,
      deductions: parseFloat(formData.get("deductions") as string) || 0,
      status: formData.get("status") as string,
    };

    if (selectedRecord) {
      updatePayrollMutation.mutate({ id: selectedRecord.id, updates: payrollData });
    } else {
      processPayrollMutation.mutate(payrollData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalGrossPay = payrollRecords.reduce((sum, record) => sum + record.grossPay, 0);
  const totalNetPay = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions, 0);

  if (recordsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee payroll and compensation</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleProcessPayroll}>
            <DollarSign className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGrossPay.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Current period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalNetPay.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">After deductions</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeductions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Taxes & benefits</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <div className="text-sm text-muted-foreground">Active employees</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
          <TabsTrigger value="employees">Employee Setup</TabsTrigger>
        </TabsList>

        {/* Payroll Records */}
        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payroll Records</h2>
            <Button onClick={() => { setSelectedRecord(null); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          <div className="space-y-4">
            {payrollRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{record.department}</div>
                        <div className="text-sm text-muted-foreground">{record.position}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Pay Period</div>
                        <div className="font-medium">{record.payPeriod}</div>
                        <div className="text-sm text-muted-foreground">{record.hoursWorked}h worked</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Gross Pay</div>
                        <div className="font-medium">${record.grossPay.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Net: ${record.netPay.toLocaleString()}</div>
                      </div>
                      <div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Pay Date: {new Date(record.payDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Employee Setup */}
        <TabsContent value="employees" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Employee Setup</h2>
            <Button onClick={() => toast({ title: "Add Employee", description: "Navigate to User Management to add employees" })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                    </div>
                    <Badge variant="outline">{employee.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Position:</span>
                      <span className="font-medium">{employee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pay Type:</span>
                      <span className="font-medium">{employee.payType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rate:</span>
                      <span className="font-medium">
                        {employee.payType === 'hourly' 
                          ? `$${employee.hourlyRate}/hr` 
                          : `$${employee.salary.toLocaleString()}/year`
                        }
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Employee", description: "Navigate to User Management to edit employees" })}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "View History", description: "Viewing payroll history for " + employee.name })}>
                        <Calendar className="h-4 w-4 mr-1" />
                        History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Payroll Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRecord ? "Edit Payroll Record" : "Add Payroll Record"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employeeId">Employee</Label>
              <Select name="employeeId" defaultValue={selectedRecord?.employeeId?.toString() || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payPeriod">Pay Period</Label>
                <Input
                  id="payPeriod"
                  name="payPeriod"
                  defaultValue={selectedRecord?.payPeriod || ""}
                  placeholder="e.g., 01/01/2024 - 01/15/2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="hoursWorked">Hours Worked</Label>
                <Input
                  id="hoursWorked"
                  name="hoursWorked"
                  type="number"
                  step="0.1"
                  defaultValue={selectedRecord?.hoursWorked || ""}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overtimeHours">Overtime Hours</Label>
                <Input
                  id="overtimeHours"
                  name="overtimeHours"
                  type="number"
                  step="0.1"
                  defaultValue={selectedRecord?.overtimeHours || ""}
                />
              </div>
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  id="deductions"
                  name="deductions"
                  type="number"
                  step="0.01"
                  defaultValue={selectedRecord?.deductions || ""}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={selectedRecord?.status || "pending"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedRecord ? "Update" : "Process"} Payroll
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}