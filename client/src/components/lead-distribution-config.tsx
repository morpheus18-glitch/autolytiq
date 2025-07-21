import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  Target, 
  Clock, 
  Globe, 
  ArrowRight, 
  RotateCcw, 
  Shuffle, 
  Brain, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Calendar,
  UserCheck,
  Building,
  Shield,
  Activity,
  Save,
  X
} from 'lucide-react';
import type { LeadDistributionRule, InsertLeadDistributionRule } from '@shared/schema';

interface DistributionRule {
  id: number;
  ruleName: string;
  source: string;
  leadType: string;
  priority: string;
  vehicleType: string;
  assignmentMethod: string;
  assignToRole?: string;
  assignToUser?: string;
  maxLeadsPerUser: number;
  businessHoursOnly: boolean;
  weekendsIncluded: boolean;
  isActive: boolean;
  createdAt: string;
}

const mockDistributionRules: DistributionRule[] = [
  {
    id: 1,
    ruleName: "High Priority AutoTrader",
    source: "AutoTrader",
    leadType: "inquiry",
    priority: "high",
    vehicleType: "new",
    assignmentMethod: "skill_based",
    assignToRole: "Senior Sales Rep",
    maxLeadsPerUser: 5,
    businessHoursOnly: true,
    weekendsIncluded: false,
    isActive: true,
    createdAt: "2025-01-21T08:00:00Z"
  },
  {
    id: 2,
    ruleName: "Weekend Appointments",
    source: "Cars.com",
    leadType: "appointment",
    priority: "medium",
    vehicleType: "used",
    assignmentMethod: "round_robin",
    assignToUser: "Weekend Team",
    maxLeadsPerUser: 10,
    businessHoursOnly: false,
    weekendsIncluded: true,
    isActive: true,
    createdAt: "2025-01-20T14:30:00Z"
  },
  {
    id: 3,
    ruleName: "Service Inquiries",
    source: "Website",
    leadType: "service",
    priority: "low",
    vehicleType: "any",
    assignmentMethod: "territory",
    assignToRole: "Service Advisor",
    maxLeadsPerUser: 15,
    businessHoursOnly: true,
    weekendsIncluded: false,
    isActive: true,
    createdAt: "2025-01-19T10:15:00Z"
  }
];

interface LeadDistributionConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadDistributionConfig({ isOpen, onClose }: LeadDistributionConfigProps) {
  const [selectedRule, setSelectedRule] = useState<DistributionRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simulate distribution rules query
  const { data: distributionRules = mockDistributionRules, isLoading } = useQuery({
    queryKey: ['/api/lead-distribution-rules'],
    queryFn: async () => {
      // For demo purposes, return mock data
      // In production, this would fetch from /api/lead-distribution-rules
      return mockDistributionRules;
    }
  });

  const getAssignmentMethodIcon = (method: string) => {
    switch (method) {
      case 'round_robin': return <RotateCcw className="w-4 h-4" />;
      case 'random': return <Shuffle className="w-4 h-4" />;
      case 'skill_based': return <Brain className="w-4 h-4" />;
      case 'territory': return <MapPin className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={cn(
        "text-xs",
        isActive 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      )}>
        {isActive ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Lead Distribution Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-blue-900">Distribution Rules Management</h3>
              <p className="text-sm text-blue-700">
                Configure how leads are automatically assigned to sales staff based on source, type, and priority
              </p>
            </div>
            <Button onClick={() => setShowRuleForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Rule
            </Button>
          </div>

          {/* Rules Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribution Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Lead Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignment Method</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Max Leads</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributionRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.ruleName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            {rule.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {rule.leadType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            rule.priority === 'high' 
                              ? "bg-red-100 text-red-800"
                              : rule.priority === 'medium'
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          )}>
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            {getAssignmentMethodIcon(rule.assignmentMethod)}
                            {rule.assignmentMethod.replace('_', ' ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {rule.assignToRole && (
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                {rule.assignToRole}
                              </div>
                            )}
                            {rule.assignToUser && (
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                {rule.assignToUser}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{rule.maxLeadsPerUser}</TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600">
                            {rule.businessHoursOnly ? "Business Hours" : "24/7"}
                            {rule.weekendsIncluded && <div>+ Weekends</div>}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(rule.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRule(rule);
                                setIsEditing(true);
                                setShowRuleForm(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Active Rules</p>
                    <p className="text-lg font-semibold">{distributionRules.filter(r => r.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Assigned Users</p>
                    <p className="text-lg font-semibold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Lead Sources</p>
                    <p className="text-lg font-semibold">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">24/7 Rules</p>
                    <p className="text-lg font-semibold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rule Form Dialog */}
        <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Distribution Rule' : 'Create New Distribution Rule'}
              </DialogTitle>
            </DialogHeader>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input id="ruleName" placeholder="Enter rule name" />
                </div>
                <div>
                  <Label htmlFor="source">Lead Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AutoTrader">AutoTrader</SelectItem>
                      <SelectItem value="Cars.com">Cars.com</SelectItem>
                      <SelectItem value="CarMax">CarMax</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="leadType">Lead Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="trade_inquiry">Trade Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="certified">Certified</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="assignmentMethod">Assignment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="skill_based">Skill Based</SelectItem>
                    <SelectItem value="territory">Territory Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignToRole">Assign to Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                      <SelectItem value="Senior Sales Rep">Senior Sales Rep</SelectItem>
                      <SelectItem value="Junior Sales Rep">Junior Sales Rep</SelectItem>
                      <SelectItem value="Service Advisor">Service Advisor</SelectItem>
                      <SelectItem value="BDC Rep">BDC Representative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxLeads">Max Leads Per User</Label>
                  <Input id="maxLeads" type="number" placeholder="10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="businessHours" />
                  <Label htmlFor="businessHours">Business Hours Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="weekends" />
                  <Label htmlFor="weekends">Include Weekends</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isActive" />
                <Label htmlFor="isActive">Rule is Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRuleForm(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}