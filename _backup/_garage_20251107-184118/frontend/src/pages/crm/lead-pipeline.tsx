import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Upload,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Car,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Filter,
  Download,
} from 'lucide-react';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui';

// Interfaces
interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  vehicle: string;
  source: string;
  priority: 'hot' | 'warm' | 'cold';
  score: number;
  value: number;
  assignedTo: string;
  createdAt: string;
  lastContact?: string;
  nextAction?: string;
  notes?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  leads: Lead[];
  color: string;
}

// Demo data
const demoLeads: Lead[] = [
  {
    id: '1',
    customerName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '555-0123',
    vehicle: '2024 Toyota Camry',
    source: 'Autotrader',
    priority: 'hot',
    score: 92,
    value: 35000,
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-11-04T09:00:00',
    lastContact: '2024-11-04T14:30:00',
    nextAction: 'Follow up call scheduled for tomorrow',
  },
  {
    id: '2',
    customerName: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '555-0124',
    vehicle: '2023 Honda CR-V',
    source: 'Website',
    priority: 'warm',
    score: 75,
    value: 28900,
    assignedTo: 'Mike Chen',
    createdAt: '2024-11-04T10:00:00',
    nextAction: 'Send pricing information',
  },
  {
    id: '3',
    customerName: 'Robert Martinez',
    email: 'r.martinez@email.com',
    phone: '555-0125',
    vehicle: '2024 Ford F-150',
    source: 'Cars.com',
    priority: 'hot',
    score: 88,
    value: 45000,
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-11-04T11:00:00',
    nextAction: 'Schedule test drive',
  },
  {
    id: '4',
    customerName: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '555-0126',
    vehicle: '2024 Chevy Silverado',
    source: 'Facebook',
    priority: 'warm',
    score: 68,
    value: 38000,
    assignedTo: 'Mike Chen',
    createdAt: '2024-11-03T15:00:00',
    nextAction: 'Email trade-in appraisal',
  },
];

const initialStages: PipelineStage[] = [
  { id: 'new', name: 'New Leads', leads: [demoLeads[0], demoLeads[1]], color: 'blue' },
  { id: 'contacted', name: 'Contacted', leads: [demoLeads[2]], color: 'purple' },
  { id: 'qualified', name: 'Qualified', leads: [demoLeads[3]], color: 'yellow' },
  { id: 'appointment', name: 'Appointment Set', leads: [], color: 'orange' },
  { id: 'showroom', name: 'In Showroom', leads: [], color: 'green' },
  { id: 'negotiation', name: 'Negotiation', leads: [], color: 'red' },
];

const priorityConfig = {
  hot: { label: 'Hot', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  warm: { label: 'Warm', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  cold: { label: 'Cold', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function LeadPipeline() {
  const [stages, setStages] = useState<PipelineStage[]>(initialStages);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [adfXmlInput, setAdfXmlInput] = useState('');

  const { data: leads = demoLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => demoLeads,
  });

  // Calculate stats
  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.priority === 'hot').length,
    value: leads.reduce((sum, l) => sum + l.value, 0),
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length),
  };

  // Handle ADF/XML import
  const handleImportLeads = () => {
    try {
      // Parse ADF/XML (simplified demo)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(adfXmlInput, 'text/xml');

      // Extract lead data (this is a simplified example)
      const prospects = xmlDoc.getElementsByTagName('prospect');

      if (prospects.length === 0) {
        alert('No valid ADF/XML data found. Please check the format.');
        return;
      }

      alert(`Successfully parsed ${prospects.length} lead(s)! (Demo mode - leads will be added to "New Leads" stage)`);
      setShowImportModal(false);
      setAdfXmlInput('');
    } catch (error) {
      alert('Error parsing ADF/XML. Please check the format.');
    }
  };

  const exampleADF = `<?xml version="1.0" encoding="UTF-8"?>
<adf>
  <prospect>
    <customer>
      <contact>
        <name>John Doe</name>
        <email>john.doe@email.com</email>
        <phone>555-1234</phone>
      </contact>
    </customer>
    <vehicle interest="buy">
      <year>2024</year>
      <make>Toyota</make>
      <model>Camry</model>
    </vehicle>
    <vendor>
      <vendorname>Autotrader</vendorname>
    </vendor>
  </prospect>
</adf>`;

  return (
    <div className="p-4 space-y-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Pipeline</h1>
          <p className="text-sm text-muted-foreground">Visual pipeline with drag-and-drop management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Import ADF/XML
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hot Leads</p>
              <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.value)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{stats.avgScore}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{stage.name}</h3>
                <Badge variant="secondary">{stage.leads.length}</Badge>
              </div>
              <div className={`h-1 w-full bg-${stage.color}-500 rounded-full mt-2`} />
            </div>

            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              {stage.leads.map((lead) => (
                <Card
                  key={lead.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{lead.customerName}</h4>
                        <p className="text-sm text-muted-foreground">{lead.vehicle}</p>
                      </div>
                      <Badge className={priorityConfig[lead.priority].color}>
                        {priorityConfig[lead.priority].label}
                      </Badge>
                    </div>

                    {/* Score & Value */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-muted-foreground">Score:</div>
                        <div className="text-sm font-semibold">{lead.score}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                        <div className="text-sm font-semibold">{formatCurrency(lead.value)}</div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {lead.source}
                      </div>
                    </div>

                    {/* Assigned To */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{lead.assignedTo}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${lead.phone}`;
                        }}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${lead.email}`;
                        }}
                      >
                        <Mail className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `sms:${lead.phone}`;
                        }}
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {stage.leads.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No leads in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADF/XML Import Modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Import ADF/XML Leads</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowImportModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Paste ADF/XML data from lead providers (Autotrader, Cars.com, etc.)
                </p>
                <textarea
                  className="w-full h-64 p-3 bg-background border border-border rounded-lg font-mono text-sm"
                  placeholder={exampleADF}
                  value={adfXmlInput}
                  onChange={(e) => setAdfXmlInput(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAdfXmlInput(exampleADF)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Load Example
                </Button>
                <Button
                  onClick={handleImportLeads}
                  disabled={!adfXmlInput.trim()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Leads
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Supported Fields:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Customer name, email, phone</li>
                  <li>• Vehicle year, make, model, trim</li>
                  <li>• Lead source / vendor</li>
                  <li>• Comments / notes</li>
                  <li>• Trade-in information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedLead.customerName}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Interest</p>
                  <p className="font-semibold">{selectedLead.vehicle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  <p className="font-semibold">{formatCurrency(selectedLead.value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lead Score</p>
                  <p className="font-semibold">{selectedLead.score}/100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge className={priorityConfig[selectedLead.priority].color}>
                    {priorityConfig[selectedLead.priority].label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.email}</span>
                  </div>
                </div>
              </div>

              {selectedLead.nextAction && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Next Action</p>
                  <p className="text-sm bg-muted/50 p-3 rounded">{selectedLead.nextAction}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button className="flex-1 gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
