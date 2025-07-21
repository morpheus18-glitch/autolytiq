import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Plus, Edit, Trash2, Target, Users, Clock, Settings, ArrowRight, RotateCw, Shuffle, TrendingUp, Globe } from "lucide-react";
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
  // Advanced rule settings
  timeBasedRules?: {
    enabled: boolean;
    morningWeight: number;
    afternoonWeight: number;
    eveningWeight: number;
  };
  geographicRules?: {
    enabled: boolean;
    zipCodeGroups: string[];
    preferLocalReps: boolean;
  };
  skillBasedRules?: {
    enabled: boolean;
    requiredSkills: string[];
    experienceLevel: string;
  };
}

interface LeadSource {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  apiEndpoint?: string;
  xmlFormat?: string;
  defaultPriority: string;
  averageLeadsPerDay: number;
  conversionRate: number;
}

export default function LeadDistribution() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeadDistributionRule | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("all");

  // Fetch distribution rules
  const { data: rules = [], isLoading } = useQuery<LeadDistributionRule[]>({
    queryKey: ["/api/lead-distribution-rules"]
  });

  // Fetch lead sources
  const { data: sources = [], isLoading: sourcesLoading } = useQuery<LeadSource[]>({
    queryKey: ["/api/lead-sources"]
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
    isActive: true,
    timeBasedRules: {
      enabled: false,
      morningWeight: 1.0,
      afternoonWeight: 1.0,
      eveningWeight: 0.5
    },
    geographicRules: {
      enabled: false,
      zipCodeGroups: [],
      preferLocalReps: false
    },
    skillBasedRules: {
      enabled: false,
      requiredSkills: [],
      experienceLevel: "any"
    }
  });

  const [newSource, setNewSource] = useState({
    name: "",
    type: "xml_feed",
    isActive: true,
    apiEndpoint: "",
    xmlFormat: "adf",
    defaultPriority: "medium",
    averageLeadsPerDay: 0,
    conversionRate: 0
  });

  const handleCreateRule = () => {
    createMutation.mutate(newRule);
  };

  // Create source mutation
  const createSourceMutation = useMutation({
    mutationFn: async (newSourceData: Partial<LeadSource>) => {
      const response = await fetch('/api/lead-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSourceData)
      });
      if (!response.ok) throw new Error('Failed to create source');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      setIsSourceDialogOpen(false);
    }
  });

  const handleCreateSource = () => {
    createSourceMutation.mutate(newSource);
  };

  // Filter rules by selected source
  const filteredRules = selectedSource === "all" 
    ? rules 
    : rules.filter(rule => rule.source === selectedSource);

  const getAssignmentMethodIcon = (method: string) => {
    switch (method) {
      case 'round_robin': return <RotateCw className="w-4 h-4" />;
      case 'snake_draft': return <ArrowRight className="w-4 h-4" />;
      case 'skill_based': return <TrendingUp className="w-4 h-4" />;
      case 'workload': return <Users className="w-4 h-4" />;
      case 'random': return <Shuffle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getAssignmentDescription = (method: string) => {
    switch (method) {
      case 'round_robin': return 'Distributes leads evenly in rotation';
      case 'snake_draft': return 'Alternating back-and-forth assignment pattern';
      case 'skill_based': return 'Assigns based on rep skills and expertise';
      case 'workload': return 'Balances based on current workload';
      case 'random': return 'Random assignment for equal opportunity';
      case 'manual': return 'Manual assignment by manager';
      default: return 'Standard assignment method';
    }
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
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lead Distribution</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Configure assignment rules and source management</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Manage Sources
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Distribution Rule</DialogTitle>
                <DialogDescription>
                  Define comprehensive lead assignment rules with advanced options
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Rules</TabsTrigger>
                  <TabsTrigger value="conditions">Conditions</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
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
                      <Label>Assignment Method</Label>
                      <Select value={newRule.assignmentMethod} onValueChange={(value) => setNewRule({...newRule, assignmentMethod: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round_robin">
                            <div className="flex items-center gap-2">
                              <RotateCw className="w-4 h-4" />
                              Round Robin
                            </div>
                          </SelectItem>
                          <SelectItem value="snake_draft">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-4 h-4" />
                              Snake Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="skill_based">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Skill-Based
                            </div>
                          </SelectItem>
                          <SelectItem value="workload">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Workload Balance
                            </div>
                          </SelectItem>
                          <SelectItem value="random">
                            <div className="flex items-center gap-2">
                              <Shuffle className="w-4 h-4" />
                              Random
                            </div>
                          </SelectItem>
                          <SelectItem value="manual">Manual Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {getAssignmentDescription(newRule.assignmentMethod)}
                      </p>
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
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <p className="text-sm text-gray-600">Advanced assignment rules will be available in future updates.</p>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-4">
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
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Source Management Dialog */}
          <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Lead Sources</DialogTitle>
                <DialogDescription>
                  Add and configure lead sources for your distribution rules
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Name</Label>
                    <Input 
                      placeholder="e.g., AutoTrader Premium"
                      value={newSource.name}
                      onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select value={newSource.type} onValueChange={(value) => setNewSource({...newSource, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xml_feed">XML Feed</SelectItem>
                        <SelectItem value="web_form">Web Form</SelectItem>
                        <SelectItem value="phone_lead">Phone Lead</SelectItem>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Endpoint (if applicable)</Label>
                  <Input 
                    placeholder="https://api.autotrader.com/leads"
                    value={newSource.apiEndpoint}
                    onChange={(e) => setNewSource({...newSource, apiEndpoint: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsSourceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSource} disabled={createSourceMutation.isPending}>
                    {createSourceMutation.isPending ? "Creating..." : "Add Source"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Source Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Filter by Source</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source.id} value={source.name}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''} active
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
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
          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <span className="text-lg">{rule.ruleName}</span>
                        <Badge className={getStatusColor(rule.isActive)}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {getAssignmentMethodIcon(rule.assignmentMethod)}
                        {getAssignmentDescription(rule.assignmentMethod)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Priority</p>
                      <Badge className={getPriorityColor(rule.priority)} variant="secondary">
                        {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Source</p>
                      <p className="text-sm font-medium">{rule.source}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Assigned To</p>
                      <p className="text-sm">{rule.assignToRole}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Max Leads</p>
                      <p className="text-sm">{rule.maxLeadsPerUser} per user</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rule.businessHoursOnly && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Business Hours
                      </Badge>
                    )}
                    {rule.weekendsIncluded && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Weekends
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {rule.leadType.replace('_', ' ')}
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

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
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
          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <span className="text-lg">{rule.ruleName}</span>
                        <Badge className={getStatusColor(rule.isActive)}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {getAssignmentMethodIcon(rule.assignmentMethod)}
                        {getAssignmentDescription(rule.assignmentMethod)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Priority</p>
                      <Badge className={getPriorityColor(rule.priority)} variant="secondary">
                        {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Source</p>
                      <p className="text-sm font-medium">{rule.source}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Assigned To</p>
                      <p className="text-sm">{rule.assignToRole}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Max Leads</p>
                      <p className="text-sm">{rule.maxLeadsPerUser} per user</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rule.businessHoursOnly && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Business Hours
                      </Badge>
                    )}
                    {rule.weekendsIncluded && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Weekends
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {rule.leadType.replace('_', ' ')}
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