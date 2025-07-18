import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdvancedSearch, { type FilterOption, type SearchFilters } from "@/components/advanced-search";
import { useAdvancedSearch, commonFilters } from "@/hooks/use-advanced-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, Phone, Mail, MapPin, User, TrendingUp, CreditCard, Users } from "lucide-react";
import type { Customer } from "@shared/schema";

interface EnhancedCustomerSearchProps {
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: number) => void;
  onView?: (customer: Customer) => void;
  showAddButton?: boolean;
  onAdd?: () => void;
}

export default function EnhancedCustomerSearch({
  onEdit,
  onDelete,
  onView,
  showAddButton = true,
  onAdd
}: EnhancedCustomerSearchProps) {
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: salesConsultants } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      id: "status",
      label: "Customer Status",
      type: "select",
      options: [
        { value: "prospect", label: "Prospect" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "hot_lead", label: "Hot Lead" },
        { value: "cold_lead", label: "Cold Lead" },
        { value: "customer", label: "Customer" },
        { value: "repeat_customer", label: "Repeat Customer" }
      ]
    },
    {
      id: "salesConsultant",
      label: "Sales Consultant",
      type: "select",
      options: salesConsultants?.map(consultant => ({
        value: `${consultant.firstName} ${consultant.lastName}`,
        label: `${consultant.firstName} ${consultant.lastName}`
      })) || []
    },
    {
      id: "leadSource",
      label: "Lead Source",
      type: "select",
      options: [
        { value: "website", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "social_media", label: "Social Media" },
        { value: "advertisement", label: "Advertisement" },
        { value: "walk_in", label: "Walk-in" },
        { value: "phone", label: "Phone" },
        { value: "email", label: "Email" },
        { value: "trade_show", label: "Trade Show" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "creditScore",
      label: "Credit Score Range",
      type: "range",
      min: 300,
      max: 850
    },
    {
      id: "income",
      label: "Income Range",
      type: "range",
      min: 0,
      max: 200000
    },
    {
      id: "state",
      label: "State",
      type: "select",
      options: [
        { value: "AL", label: "Alabama" },
        { value: "AK", label: "Alaska" },
        { value: "AZ", label: "Arizona" },
        { value: "AR", label: "Arkansas" },
        { value: "CA", label: "California" },
        { value: "CO", label: "Colorado" },
        { value: "CT", label: "Connecticut" },
        { value: "DE", label: "Delaware" },
        { value: "FL", label: "Florida" },
        { value: "GA", label: "Georgia" },
        { value: "HI", label: "Hawaii" },
        { value: "ID", label: "Idaho" },
        { value: "IL", label: "Illinois" },
        { value: "IN", label: "Indiana" },
        { value: "IA", label: "Iowa" },
        { value: "KS", label: "Kansas" },
        { value: "KY", label: "Kentucky" },
        { value: "LA", label: "Louisiana" },
        { value: "ME", label: "Maine" },
        { value: "MD", label: "Maryland" },
        { value: "MA", label: "Massachusetts" },
        { value: "MI", label: "Michigan" },
        { value: "MN", label: "Minnesota" },
        { value: "MS", label: "Mississippi" },
        { value: "MO", label: "Missouri" },
        { value: "MT", label: "Montana" },
        { value: "NE", label: "Nebraska" },
        { value: "NV", label: "Nevada" },
        { value: "NH", label: "New Hampshire" },
        { value: "NJ", label: "New Jersey" },
        { value: "NM", label: "New Mexico" },
        { value: "NY", label: "New York" },
        { value: "NC", label: "North Carolina" },
        { value: "ND", label: "North Dakota" },
        { value: "OH", label: "Ohio" },
        { value: "OK", label: "Oklahoma" },
        { value: "OR", label: "Oregon" },
        { value: "PA", label: "Pennsylvania" },
        { value: "RI", label: "Rhode Island" },
        { value: "SC", label: "South Carolina" },
        { value: "SD", label: "South Dakota" },
        { value: "TN", label: "Tennessee" },
        { value: "TX", label: "Texas" },
        { value: "UT", label: "Utah" },
        { value: "VT", label: "Vermont" },
        { value: "VA", label: "Virginia" },
        { value: "WA", label: "Washington" },
        { value: "WV", label: "West Virginia" },
        { value: "WI", label: "Wisconsin" },
        { value: "WY", label: "Wyoming" }
      ]
    },
    {
      id: "zipCode",
      label: "Zip Code",
      type: "text",
      placeholder: "Enter zip code..."
    },
    {
      id: "dateAdded",
      label: "Date Added",
      type: "date"
    },
    {
      id: "isActive",
      label: "Active Customer",
      type: "boolean"
    },
    {
      id: "hasPhone",
      label: "Has Phone Number",
      type: "boolean"
    },
    {
      id: "hasEmail",
      label: "Has Email",
      type: "boolean"
    }
  ];

  // Define custom filter functions
  const filterFunctions = {
    status: commonFilters.status,
    salesConsultant: (customer: Customer, value: string) => 
      customer.salesConsultant === value,
    leadSource: (customer: Customer, value: string) => 
      customer.leadSource === value,
    creditScore: commonFilters.numericRange<Customer>("creditScore"),
    income: commonFilters.numericRange<Customer>("income"),
    state: (customer: Customer, value: string) => 
      customer.state === value,
    zipCode: commonFilters.textContains<Customer>("zipCode"),
    dateAdded: commonFilters.dateRange,
    isActive: commonFilters.boolean<Customer>("isActive"),
    hasPhone: (customer: Customer, value: boolean) => 
      value ? Boolean(customer.phone) : !Boolean(customer.phone),
    hasEmail: (customer: Customer, value: boolean) => 
      value ? Boolean(customer.email) : !Boolean(customer.email)
  };

  // Use the advanced search hook
  const {
    filteredData,
    filters,
    handleFiltersChange,
    handleClear
  } = useAdvancedSearch({
    data: customers || [],
    searchFields: ["firstName", "lastName", "email", "phone", "address", "city"],
    filterFunctions
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCustomers = filteredData.length;
    const statusBreakdown = filteredData.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCreditScore = filteredData.filter(c => c.creditScore).length > 0
      ? filteredData.reduce((sum, c) => sum + (c.creditScore || 0), 0) / filteredData.filter(c => c.creditScore).length
      : 0;

    const avgIncome = filteredData.filter(c => c.income).length > 0
      ? filteredData.reduce((sum, c) => sum + (c.income || 0), 0) / filteredData.filter(c => c.income).length
      : 0;

    const consultantBreakdown = filteredData.reduce((acc, customer) => {
      const consultant = customer.salesConsultant || "Unassigned";
      acc[consultant] = (acc[consultant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCustomers,
      statusBreakdown,
      avgCreditScore,
      avgIncome,
      consultantBreakdown
    };
  }, [filteredData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "hot_lead":
        return "bg-red-100 text-red-800";
      case "cold_lead":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-purple-100 text-purple-800";
      case "repeat_customer":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search Component */}
      <AdvancedSearch
        searchPlaceholder="Search customers by name, email, phone, address, or city..."
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        onClear={handleClear}
      />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{summaryStats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Credit Score</p>
                <p className="text-2xl font-bold">{Math.round(summaryStats.avgCreditScore)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Income</p>
                <p className="text-2xl font-bold">${summaryStats.avgIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Status Breakdown</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(summaryStats.statusBreakdown).map(([status, count]) => (
                    <Badge key={status} variant="secondary" className="text-xs">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Customer Database ({filteredData.length} customers)
            </CardTitle>
            {showAddButton && onAdd && (
              <Button onClick={onAdd} className="bg-primary hover:bg-blue-700">
                Add Customer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Credit Score</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sales Consultant</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.leadSource && `Source: ${customer.leadSource}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-1" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <div>
                          {customer.city && customer.state ? (
                            <div>{customer.city}, {customer.state}</div>
                          ) : (
                            <div>{customer.address || "N/A"}</div>
                          )}
                          {customer.zipCode && (
                            <div className="text-gray-500">{customer.zipCode}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.creditScore ? (
                        <div className="font-semibold">{customer.creditScore}</div>
                      ) : (
                        <div className="text-gray-400">N/A</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.income ? (
                        <div className="font-semibold">${customer.income.toLocaleString()}</div>
                      ) : (
                        <div className="text-gray-400">N/A</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.salesConsultant || "Unassigned"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {onView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(customer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No customers found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}