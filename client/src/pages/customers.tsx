import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Phone, Mail, MapPin, User, Calendar, CreditCard, FileText, Car, Tag } from "lucide-react";
import { useState } from "react";
import type { Customer, CustomerNote, CustomerCall } from "@shared/schema";

interface CustomerCardProps {
  customer: Customer;
  onClose: () => void;
}

function CustomerCard({ customer, onClose }: CustomerCardProps) {
  const { data: notes } = useQuery<CustomerNote[]>({
    queryKey: ["/api/customers", customer.id, "notes"],
  });

  const { data: calls } = useQuery<CustomerCall[]>({
    queryKey: ["/api/customers", customer.id, "calls"],
  });

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {customer.profileImage ? (
              <img src={customer.profileImage} alt={customer.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{customer.name}</h2>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{customer.phone || "No phone"}</span>
              {customer.phone && (
                <Button size="sm" variant="outline" className="ml-auto">
                  Call
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{customer.address || "No address"}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                DOB: {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : "Not provided"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                Credit Score: {customer.creditScore || "Not available"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                License: {customer.licenseNumber || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {customer.tags && customer.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {customer.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for detailed information */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="calls">Call History</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicle Interest</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Customer Notes</h3>
              <Button size="sm">Add Note</Button>
            </div>
            <div className="space-y-3">
              {notes?.map((note) => (
                <Card key={note.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{note.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              )) || (
                <p className="text-gray-500 text-center py-8">No notes available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calls" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Call History</h3>
              <Button size="sm">Log Call</Button>
            </div>
            <div className="space-y-3">
              {calls?.map((call) => (
                <Card key={call.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={call.callType === 'inbound' ? 'default' : 'secondary'}>
                          {call.callType}
                        </Badge>
                        <span className="text-sm">{call.phoneNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{call.notes}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(call.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              )) || (
                <p className="text-gray-500 text-center py-8">No call history available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Vehicle Interest</h3>
              <Button size="sm">Add Interest</Button>
            </div>
            <p className="text-gray-500 text-center py-8">No vehicle interests recorded</p>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documents</h3>
              <Button size="sm">Upload Document</Button>
            </div>
            <p className="text-gray-500 text-center py-8">No documents uploaded</p>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  );
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === "all" || 
      (filterBy === "active" && customer.isActive) ||
      (filterBy === "inactive" && !customer.isActive) ||
      (filterBy === "has-phone" && customer.phone) ||
      (filterBy === "has-license" && customer.licenseNumber);

    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="text-gray-500">Advanced customer relationship management</p>
          </div>
          <Button className="bg-primary text-white hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </header>

      {/* Advanced Search and Filters */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, address, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
              <SelectItem value="has-phone">With Phone</SelectItem>
              <SelectItem value="has-license">With License</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Database ({filteredCustomers.length} customers)
              </h3>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="animate-pulse">Loading customers...</div>
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No customers found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              {customer.profileImage ? (
                                <img src={customer.profileImage} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {customer.address.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={customer.isActive ? "default" : "secondary"}>
                            {customer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.creditScore ? (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              {customer.creditScore}
                            </div>
                          ) : (
                            "Not available"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Customer Profile Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        {selectedCustomer && (
          <CustomerCard 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
          />
        )}
      </Dialog>
    </div>
  );
}
