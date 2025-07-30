import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Settings
} from "lucide-react";

interface ComplianceItem {
  id: string;
  type: 'document' | 'training' | 'audit' | 'certification';
  title: string;
  status: 'compliant' | 'warning' | 'non-compliant' | 'pending';
  dueDate: string;
  lastUpdated: string;
  assignedTo: string;
  description: string;
}

export default function ComplianceManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock compliance data - would be fetched from backend
  const complianceItems: ComplianceItem[] = [
    {
      id: '1',
      type: 'document',
      title: 'Truth in Lending Act Documentation',
      status: 'compliant',
      dueDate: '2025-03-15',
      lastUpdated: '2025-01-15',
      assignedTo: 'F&I Manager',
      description: 'Ensure all lending documentation meets TILA requirements'
    },
    {
      id: '2',
      type: 'training',
      title: 'Fair Credit Reporting Act Training',
      status: 'warning',
      dueDate: '2025-02-01',
      lastUpdated: '2024-11-15',
      assignedTo: 'Sales Team',
      description: 'Annual FCRA compliance training for sales staff'
    },
    {
      id: '3',
      type: 'certification',
      title: 'Dealer License Renewal',
      status: 'pending',
      dueDate: '2025-04-30',
      lastUpdated: '2025-01-10',
      assignedTo: 'General Manager',
      description: 'State dealer license renewal application'
    },
    {
      id: '4',
      type: 'audit',
      title: 'F&I Process Audit',
      status: 'non-compliant',
      dueDate: '2025-01-25',
      lastUpdated: '2025-01-20',
      assignedTo: 'F&I Manager',
      description: 'Internal audit of F&I processes and documentation'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Calendar className="w-4 h-4" />;
      default: return <FileCheck className="w-4 h-4" />;
    }
  };

  const filteredItems = complianceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const complianceStats = {
    total: complianceItems.length,
    compliant: complianceItems.filter(item => item.status === 'compliant').length,
    warning: complianceItems.filter(item => item.status === 'warning').length,
    nonCompliant: complianceItems.filter(item => item.status === 'non-compliant').length,
    pending: complianceItems.filter(item => item.status === 'pending').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Compliance Manager</h1>
            <p className="text-gray-600">Monitor and manage regulatory compliance across all dealership operations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Documents
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{complianceStats.total}</p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{complianceStats.compliant}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceStats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{complianceStats.nonCompliant}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{complianceStats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search compliance items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="document">Documents</option>
                <option value="training">Training</option>
                <option value="audit">Audits</option>
                <option value="certification">Certifications</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="warning">Warning</option>
                <option value="non-compliant">Non-Compliant</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}