import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdvancedSearch, { type FilterOption, type SearchFilters } from "@/components/advanced-search";
import { useAdvancedSearch, commonFilters } from "@/hooks/use-advanced-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, Phone, Mail, MapPin, User, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import type { Lead } from "@shared/schema";

interface EnhancedSalesSearchProps {
  onEdit?: (lead: Lead) => void;
  onDelete?: (id: number) => void;
  onView?: (lead: Lead) => void;
  showAddButton?: boolean;
  onAdd?: () => void;
}

export default function EnhancedSalesSearch({
  onEdit,
  onDelete,
  onView,
  showAddButton = true,
  onAdd
}: EnhancedSalesSearchProps) {
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: salesConsultants } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      id: "status",
      label: "Lead Status",
      type: "select",
      options: [
        { value: "new", label: "New" },
        { value: "contacted", label: "Contacted" },
        { value: "qualified", label: "Qualified" },
        { value: "proposal", label: "Proposal Sent" },
        { value: "negotiation", label: "In Negotiation" },
        { value: "closed_won", label: "Closed Won" },
        { value: "closed_lost", label: "Closed Lost" },
        { value: "follow_up", label: "Follow Up" }
      ]
    },
    {
      id: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" }
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
        { value: "cold_call", label: "Cold Call" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "estimatedValue",
      label: "Estimated Value Range",
      type: "range",
      min: 0,
      max: 100000
    },
    {
      id: "followUpDate",
      label: "Follow Up Date",
      type: "date"
    },
    {
      id: "dateCreated",
      label: "Date Created",
      type: "date"
    },
    {
      id: "vehicleInterest",
      label: "Vehicle Interest",
      type: "select",
      options: [
        { value: "sedan", label: "Sedan" },
        { value: "suv", label: "SUV" },
        { value: "truck", label: "Truck" },
        { value: "coupe", label: "Coupe" },
        { value: "hatchback", label: "Hatchback" },
        { value: "wagon", label: "Wagon" },
        { value: "convertible", label: "Convertible" },
        { value: "luxury", label: "Luxury" },
        { value: "electric", label: "Electric" },
        { value: "hybrid", label: "Hybrid" }
      ]
    },
    {
      id: "hasPhoneNumber",
      label: "Has Phone Number",
      type: "boolean"
    },
    {
      id: "hasEmailAddress",
      label: "Has Email Address",
      type: "boolean"
    }
  ];

  // Define custom filter functions
  const filterFunctions = {
    status: commonFilters.status,
    priority: (lead: Lead, value: string) => 
      lead.priority === value,
    salesConsultant: (lead: Lead, value: string) => 
      lead.salesConsultant === value,
    leadSource: (lead: Lead, value: string) => 
      lead.leadSource === value,
    estimatedValue: commonFilters.numericRange<Lead>("estimatedValue"),
    followUpDate: commonFilters.dateRange,
    dateCreated: commonFilters.dateRange,
    vehicleInterest: (lead: Lead, value: string) => 
      lead.vehicleInterest?.toLowerCase().includes(value.toLowerCase()),
    hasPhoneNumber: (lead: Lead, value: boolean) => 
      value ? Boolean(lead.phone) : !Boolean(lead.phone),
    hasEmailAddress: (lead: Lead, value: boolean) => 
      value ? Boolean(lead.email) : !Boolean(lead.email)
  };

  // Use the advanced search hook
  const {
    filteredData,
    filters,
    handleFiltersChange,
    handleClear
  } = useAdvancedSearch({
    data: leads || [],
    searchFields: ["customerName", "email", "phone", "notes", "vehicleInterest"],
    filterFunctions
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalLeads = filteredData.length;
    const statusBreakdown = filteredData.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEstimatedValue = filteredData.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
    const avgEstimatedValue = totalLeads > 0 ? totalEstimatedValue / totalLeads : 0;

    const priorityBreakdown = filteredData.reduce((acc, lead) => {
      const priority = lead.priority || "medium";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const consultantBreakdown = filteredData.reduce((acc, lead) => {
      const consultant = lead.salesConsultant || "Unassigned";
      acc[consultant] = (acc[consultant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      statusBreakdown,
      totalEstimatedValue,
      avgEstimatedValue,
      priorityBreakdown,
      consultantBreakdown
    };
  }, [filteredData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "proposal":
        return "bg-purple-100 text-purple-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "closed_won":
        return "bg-green-100 text-green-800";
      case "closed_lost":
        return "bg-red-100 text-red-800";
      case "follow_up":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
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
        searchPlaceholder="Search leads by name, email, phone, or vehicle interest..."
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        onClear={handleClear}
      />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{summaryStats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${summaryStats.totalEstimatedValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Lead Value</p>
                <p className="text-2xl font-bold">${summaryStats.avgEstimatedValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
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
              Sales Leads ({filteredData.length} leads)
            </CardTitle>
            {showAddButton && onAdd && (
              <Button onClick={onAdd} className="bg-primary hover:bg-blue-700">
                Add Lead
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Estimated Value</TableHead>
                  <TableHead>Vehicle Interest</TableHead>
                  <TableHead>Sales Consultant</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.customerName}</div>
                        <div className="text-sm text-gray-500">
                          {lead.leadSource && `Source: ${lead.leadSource}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-1" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-1" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(lead.priority || "medium")}>
                        {lead.priority || "medium"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.estimatedValue ? (
                        <div className="font-semibold">${lead.estimatedValue.toLocaleString()}</div>
                      ) : (
                        <div className="text-gray-400">N/A</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.vehicleInterest || "Any"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.salesConsultant || "Unassigned"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {onView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(lead.id)}
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
                No leads found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}