import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  Car,
  Eye,
  Edit3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  MapPin,
  Filter,
  Search,
  Plus
} from "lucide-react";

interface Lead {
  id: string;
  customerName: string;
  salesperson: string;
  actions: string[];
  phone: string;
  notes: string;
  moreInformation: string;
  status: 'new' | 'contacted' | 'qualified' | 'hot' | 'appointment' | 'sold' | 'lost';
  source: string;
  vehicle: string;
  value: number;
  lastContact: string;
  nextAction: string;
  priority: 'high' | 'medium' | 'low';
}

export function LeadManagementGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Mock data that matches the screenshot format
  const leads: Lead[] = [
    {
      id: "1",
      customerName: "Steve Dunn (77)",
      salesperson: "Mike Craft",
      actions: ["✏️", "📧", "📞"],
      phone: "(C) 703-350-5241",
      notes: "NOT A DEAL ON MY AMD MORE TOOK THEIR LEASE BACK, IS UPSET THEIR SAME DEAL AND WANTS THEM THE THIRD THE LEASE",
      moreInformation: "First Pencil: • 2023 Sciretto Hybrid",
      status: "new",
      source: "Website",
      vehicle: "2023 Honda Accord",
      value: 32500,
      lastContact: "Today",
      nextAction: "Follow up call",
      priority: "high"
    },
    {
      id: "2", 
      customerName: "Alejandro Thompson (88)",
      salesperson: "Tom Davis",
      actions: ["✏️", "📧"],
      phone: "(H) 309-786-1096, (W) 309-764-2906, (C) 309-863-3059",
      notes: "with Josh",
      moreInformation: "Credit: KS596A 2023 Sciretto Hybrid",
      status: "contacted",
      source: "Referral", 
      vehicle: "2023 Toyota Camry",
      value: 28900,
      lastContact: "Yesterday",
      nextAction: "Schedule test drive",
      priority: "high"
    },
    {
      id: "3",
      customerName: "Maria Rodriguez Das (178)",
      salesperson: "Sarah Wilson", 
      actions: ["✏️", "📧", "📞"],
      phone: "(H) 847-9-32",
      notes: "",
      moreInformation: "Used: KS596 2023 Sciretto Hybrid",
      status: "qualified",
      source: "Walk-in",
      vehicle: "2022 Nissan Altima", 
      value: 24500,
      lastContact: "2 days ago",
      nextAction: "Credit application",
      priority: "medium"
    },
    {
      id: "4",
      customerName: "Steve Bracken (1759)",
      salesperson: "Tom Mitchell",
      actions: ["✏️", "📧"],
      phone: "(W) 317-426-4976, (C) 317-415-6202",
      notes: "W/ Evan",
      moreInformation: "First Pencil: (T) 309-677-431, 2023 KS596 Trimline",
      status: "hot",
      source: "Internet",
      vehicle: "2023 Ford F-150",
      value: 45000,
      lastContact: "Today", 
      nextAction: "Prepare quote",
      priority: "high"
    },
    {
      id: "5",
      customerName: "Melissa Campbell (89)",
      salesperson: "David Chen",
      actions: ["✏️", "📧", "📞"],
      phone: "(H) 317-251-9519, (W) 317-334-9099, (C) 317-334-9099",
      notes: "2018 Jetta looking at options",
      moreInformation: "Used: KM647 2022 VW beetle",
      status: "appointment",
      source: "Phone",
      vehicle: "2022 Volkswagen Jetta",
      value: 21900,
      lastContact: "Today",
      nextAction: "Appointment at 2pm",
      priority: "high"
    },
    {
      id: "6",
      customerName: "Kevin Pafko (138)",
      salesperson: "Lisa Rodriguez",
      actions: ["✏️", "📧", "📞"],
      phone: "(H) 317-413-6262, (C) 317-841-6262",
      notes: "Looking at various 2022 options with Kevin looking at options",
      moreInformation: "Used: KM647 2022 Scientific Model",
      status: "qualified",
      source: "Internet",
      vehicle: "2022 Honda CR-V",
      value: 31200,
      lastContact: "Yesterday",
      nextAction: "Price comparison",
      priority: "medium"
    },
    {
      id: "7", 
      customerName: "Jennifer Kramer (59)",
      salesperson: "Mark Stevens",
      actions: ["✏️", "📧"],
      phone: "(H) 260-415-5009, (W) 260-209-5009",
      notes: "Perfection",
      moreInformation: "New: KM5543 2023 Perfection",
      status: "sold",
      source: "Referral",
      vehicle: "2023 Toyota RAV4",
      value: 33800,
      lastContact: "Today",
      nextAction: "Delivery scheduled",
      priority: "low"
    },
    {
      id: "8",
      customerName: "Oliver Sensationn (993)",
      salesperson: "Jennifer Walsh", 
      actions: ["✏️", "📧", "📞"],
      phone: "(C) 260-415-5009, (W) 260-209-5009, (H) 317-371-9490",
      notes: "W/ Sensei before but needs info back [?] where Dan Group",
      moreInformation: "First Pencil: (T) 317-371-9490",
      status: "contacted",
      source: "Website",
      vehicle: "2023 Subaru Outback",
      value: 29500,
      lastContact: "2 days ago", 
      nextAction: "Information packet",
      priority: "medium"
    }
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      qualified: "bg-green-100 text-green-800 border-green-200",
      hot: "bg-red-100 text-red-800 border-red-200",
      appointment: "bg-purple-100 text-purple-800 border-purple-200",
      sold: "bg-gray-100 text-gray-800 border-gray-200",
      lost: "bg-gray-100 text-gray-500 border-gray-200"
    };
    return (
      <Badge className={`text-xs px-2 py-1 ${colors[status as keyof typeof colors] || colors.new}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.salesperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      {/* Header that matches the screenshot */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4">
        <div className="bg-orange-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium">Control Manager</span>
            <span>Dashboard</span>
            <span>Sales Process (Luis Pacheco, J)</span>
            <span>ILM</span>
            <span>Sales Process (Davis, S)</span>
            <span>Sales Process (Thompson, M)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">5:30 Minutes</span>
            <span className="text-xs">30-60 Minutes</span>
            <span className="text-xs">60-90 Minutes</span>
            <span className="text-xs">90 Plus Minutes</span>
            <span className="text-xs">Best Hit</span>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="bg-yellow-400 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <select className="bg-white border rounded px-2 py-1 text-xs">
              <option>Name</option>
            </select>
            <select className="bg-white border rounded px-2 py-1 text-xs">  
              <option>Default</option>
            </select>
            <Button size="sm" variant="outline" className="text-xs h-6">Status</Button>
            <Button size="sm" variant="outline" className="text-xs h-6">Auto Leads</Button>
            <Button size="sm" variant="outline" className="text-xs h-6">Quick Quote</Button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Missed (Not TU): 0</span>
            <span>Delivery Only (0)</span>
            <span>Quick Quote: 0</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers, salesperson, notes, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="hot">Hot</option>
                <option value="appointment">Appointment</option>
                <option value="sold">Sold</option>
                <option value="lost">Lost</option>
              </select>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Lead Grid - Matches Screenshot Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="text-left p-2 font-medium">Customer</th>
                <th className="text-left p-2 font-medium">Actions</th>
                <th className="text-left p-2 font-medium">Salesperson / Mgr</th>
                <th className="text-left p-2 font-medium">Notes</th>
                <th className="text-left p-2 font-medium w-40">Phone Number</th>
                <th className="text-left p-2 font-medium">More Information</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={lead.id} className={`border-b hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-blue-600 cursor-pointer hover:underline">
                          {lead.customerName}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {lead.vehicle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-1">
                      {lead.actions.map((action, idx) => (
                        <Button key={idx} size="sm" variant="outline" className="h-6 w-6 p-0 text-xs">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </td>
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{lead.salesperson}</div>
                      <div className="text-gray-500">— Mike Craft</div>
                    </div>
                  </td>
                  <td className="p-2 max-w-xs">
                    <div className="text-gray-700 truncate">
                      {lead.notes || "—"}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-blue-600">
                      {lead.phone}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-gray-700 max-w-xs truncate">
                      {lead.moreInformation}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(lead.status)}
                      <div className="flex space-x-1">
                        {/* Status icons matching screenshot */}
                        <span className="text-blue-500">📧</span>
                        <span className="text-green-500">📞</span>
                        <span className="text-orange-500">💬</span>
                        <span className="text-purple-500">📅</span>
                        <span className="text-red-500">⚠️</span>
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-gray-500">👁️</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(lead.priority)}
                      <div className="text-xs">
                        <div>Last: {lead.lastContact}</div>
                        <div className="text-gray-500">Next: {lead.nextAction}</div>
                        <div className="font-medium text-green-600">
                          ${lead.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer matching screenshot */}
        <div className="bg-gray-200 border-t p-2">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-medium">Record Count:</span>
              <span className="ml-1">{filteredLeads.length} records to display</span>
            </div>
            <div className="flex space-x-4">
              <span>Status:</span>
              <span>Lead Date:</span>
              <span>Lead Age:</span>
              <span>Lead Source:</span>
              <span>Salesperson:</span>
              <span>Vehicle:</span>
            </div>
          </div>
        </div>

        {/* Uncontacted Internet Leads Footer */}
        <div className="bg-orange-100 border-t p-2">
          <div className="text-xs font-medium text-center">
            Uncontacted Internet Leads
          </div>
        </div>
      </div>
    </div>
  );
}