import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Plus, Edit, Trash2, Target, Users, Clock, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeadDistributionRule {
  id: number;
  ruleName: string;
  source: string;
  leadType: string;
  priority: string;
  vehicleType: string;
  assignmentMethod: string;
  assignToRole: string;
  maxLeadsPerUser: number;
  businessHoursOnly: boolean;
  weekendsIncluded: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function LeadDistribution() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeadDistributionRule | null>(null);

  // Fetch distribution rules
  const { data: rules = [], isLoading } = useQuery<LeadDistributionRule[]>({
    queryKey: ["/api/lead-distribution-rules"]
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: async (newRule: Partial<LeadDistributionRule>) => {
      const response = await fetch('/api/lead-distribution-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      if (!response.ok) throw new Error('Failed to create rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-distribution-rules"] });
      setIsCreateDialogOpen(false);
    }
  });

  const [newRule, setNewRule] = useState({
    ruleName: "",
    source: "AutoTrader",
    leadType: "inquiry",
    priority: "medium",
    vehicleType: "new",
    assignmentMethod: "round_robin",
    assignToRole: "Sales Rep",
    maxLeadsPerUser: 5,
    businessHoursOnly: true,
    weekendsIncluded: false,
    isActive: true
  });

  const handleCreateRule = () => {
    createMutation.mutate(newRule);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Distribution Rules</h1>
          <p className="text-gray-600 mt-2">Configure automatic lead assignment and distribution policies</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Distribution Rule</DialogTitle>
              <DialogDescription>
                Define how leads should be automatically assigned to your sales team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input 
                    placeholder="e.g., High Priority AutoTrader"
                    value={newRule.ruleName}
                    onChange={(e) => setNewRule({...newRule, ruleName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <Select value={newRule.source} onValueChange={(value) => setNewRule({...newRule, source: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AutoTrader">AutoTrader</SelectItem>
                      <SelectItem value="Cars.com">Cars.com</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Walk-In">Walk-In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Type</Label>
                  <Select value={newRule.leadType} onValueChange={(value) => setNewRule({...newRule, leadType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">General Inquiry</SelectItem>
                      <SelectItem value="test_drive">Test Drive Request</SelectItem>
                      <SelectItem value="pricing">Pricing Request</SelectItem>
                      <SelectItem value="financing">Financing Inquiry</SelectItem>
                      <SelectItem value="trade_in">Trade-in Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={newRule.priority} onValueChange={(value) => setNewRule({...newRule, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assignment Method</Label>
                  <Select value={newRule.assignmentMethod} onValueChange={(value) => setNewRule({...newRule, assignmentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="skill_based">Skill-Based</SelectItem>
                      <SelectItem value="workload">Workload Balance</SelectItem>
                      <SelectItem value="manual">Manual Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign to Role</Label>
                  <Select value={newRule.assignToRole} onValueChange={(value) => setNewRule({...newRule, assignToRole: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                      <SelectItem value="Senior Sales Rep">Senior Sales Rep</SelectItem>
                      <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                      <SelectItem value="Internet Sales">Internet Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Leads Per User</Label>
                <Input 
                  type="number" 
                  value={newRule.maxLeadsPerUser}
                  onChange={(e) => setNewRule({...newRule, maxLeadsPerUser: parseInt(e.target.value) || 5})}
                  min="1"
                  max="50"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Business Hours Only</Label>
                  <Switch 
                    checked={newRule.businessHoursOnly}
                    onCheckedChange={(checked) => setNewRule({...newRule, businessHoursOnly: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Include Weekends</Label>
                  <Switch 
                    checked={newRule.weekendsIncluded}
                    onCheckedChange={(checked) => setNewRule({...newRule, weekendsIncluded: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active Rule</Label>
                  <Switch 
                    checked={newRule.isActive}
                    onCheckedChange={(checked) => setNewRule({...newRule, isActive: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-6">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Distribution Rules</h3>
              <p className="text-gray-600 mb-4">Create your first lead distribution rule to automate lead assignments</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rule.ruleName}
                        <Badge className={getStatusColor(rule.isActive)}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Distributes {rule.source} leads with {rule.assignmentMethod} assignment
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Priority</p>
                      <Badge className={getPriorityColor(rule.priority)}>
                        {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Lead Type</p>
                      <p className="text-sm">{rule.leadType.replace('_', ' ')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Assigned To</p>
                      <p className="text-sm">{rule.assignToRole}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Max Leads</p>
                      <p className="text-sm">{rule.maxLeadsPerUser} per user</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rule.businessHoursOnly && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Business Hours Only
                      </Badge>
                    )}
                    {rule.weekendsIncluded && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Weekends Included
                      </Badge>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {rule.assignmentMethod.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* System Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Distribution rules are processed in order of priority. Higher priority rules take precedence over lower priority rules.
          Changes to rules may take up to 5 minutes to take effect for incoming leads.
        </AlertDescription>
      </Alert>
    </div>
  );
}