import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Car,
  FileText,
  Clock,
  Target,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'wouter';

interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'hot' | 'warm' | 'cold' | 'customer';
  creditScore: number;
  lifetimeValue: number;
  lastContact: string;
  nextFollowUp: string;
  preferredContactMethod: 'email' | 'phone' | 'text';
  tags: string[];
}

interface CustomerInsight {
  type: 'behavior' | 'preference' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

interface VehicleInterest {
  id: number;
  make: string;
  model: string;
  year: number;
  interestLevel: number;
  lastViewed: string;
  priceRange: [number, number];
  status: 'active' | 'quoted' | 'test-driven' | 'purchased';
}

interface CustomerTimeline {
  id: string;
  date: string;
  type: 'contact' | 'visit' | 'quote' | 'test_drive' | 'purchase' | 'service';
  title: string;
  description: string;
  outcome?: string;
}

export function Customer360Intelligence({ customerId }: { customerId?: number }) {
  // Mock data - in real app this would be fetched from API
  const [customer] = useState<CustomerProfile>({
    id: customerId || 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Austin, TX 78701',
    status: 'hot',
    creditScore: 750,
    lifetimeValue: 45000,
    lastContact: '2024-01-20',
    nextFollowUp: '2024-01-23',
    preferredContactMethod: 'email',
    tags: ['First Time Buyer', 'Financing Needed', 'Trade-In'],
  });

  const [insights] = useState<CustomerInsight[]>([
    {
      type: 'opportunity',
      title: 'High Purchase Intent',
      description: 'Customer has visited 3 times this month and spent 45+ minutes browsing SUVs',
      confidence: 87,
      action: 'Schedule test drive within 48 hours',
    },
    {
      type: 'preference',
      title: 'Budget-Conscious Buyer',
      description: 'Consistently views vehicles in $25K-$35K range with focus on fuel efficiency',
      confidence: 92,
    },
    {
      type: 'behavior',
      title: 'Digital-First Customer',
      description: 'Prefers email communication and researches extensively online before visiting',
      confidence: 78,
    },
    {
      type: 'risk',
      title: 'Price Sensitivity',
      description: 'May be comparing with 2+ other dealerships based on browsing patterns',
      confidence: 65,
      action: 'Provide competitive pricing analysis',
    },
  ]);

  const [vehicleInterests] = useState<VehicleInterest[]>([
    {
      id: 101,
      make: 'Honda',
      model: 'CR-V',
      year: 2024,
      interestLevel: 95,
      lastViewed: '2024-01-20',
      priceRange: [28000, 32000],
      status: 'active',
    },
    {
      id: 102,
      make: 'Toyota',
      model: 'RAV4',
      year: 2024,
      interestLevel: 78,
      lastViewed: '2024-01-19',
      priceRange: [29000, 35000],
      status: 'quoted',
    },
    {
      id: 103,
      make: 'Mazda',
      model: 'CX-5',
      year: 2023,
      interestLevel: 62,
      lastViewed: '2024-01-18',
      priceRange: [26000, 30000],
      status: 'test-driven',
    },
  ]);

  const [timeline] = useState<CustomerTimeline[]>([
    {
      id: 'tl-001',
      date: '2024-01-20',
      type: 'visit',
      title: 'Showroom Visit',
      description: 'Spent 45 minutes looking at Honda CR-V and Toyota RAV4',
      outcome: 'Scheduled follow-up call',
    },
    {
      id: 'tl-002',
      date: '2024-01-19',
      type: 'quote',
      title: 'Price Quote Sent',
      description: 'Email quote for 2024 Toyota RAV4 XLE - $31,500',
      outcome: 'Opened email, no response yet',
    },
    {
      id: 'tl-003',
      date: '2024-01-18',
      type: 'test_drive',
      title: 'Test Drive',
      description: 'Test drove 2023 Mazda CX-5 for 20 minutes',
      outcome: 'Positive feedback, interested in Honda CR-V comparison',
    },
    {
      id: 'tl-004',
      date: '2024-01-15',
      type: 'contact',
      title: 'Initial Inquiry',
      description: 'Called about compact SUV inventory after seeing website',
      outcome: 'Scheduled showroom appointment',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warm':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cold':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'customer':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: CustomerInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'preference':
        return <Heart className="w-4 h-4 text-blue-600" />;
      case 'behavior':
        return <Activity className="w-4 h-4 text-purple-600" />;
      case 'risk':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getTimelineIcon = (type: CustomerTimeline['type']) => {
    switch (type) {
      case 'contact':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'visit':
        return <MapPin className="w-4 h-4 text-green-600" />;
      case 'quote':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'test_drive':
        return <Car className="w-4 h-4 text-orange-600" />;
      case 'purchase':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'service':
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Customer Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            {customer.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(customer.status)}>
                {customer.status.toUpperCase()}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Link href={`/customers/${customer.id}/texting`}>
            <Button size="sm" variant="default">
              <FileText className="w-4 h-4 mr-1" />
              Message
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Score</p>
                <p className="text-2xl font-bold text-gray-900">{customer.creditScore}</p>
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lifetime Value</p>
                <p className="text-2xl font-bold text-gray-900">${(customer.lifetimeValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Contact</p>
                <p className="text-2xl font-bold text-gray-900">{Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / (1000 * 60 * 60 * 24))}d ago</p>
              </div>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Follow-up Due</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.ceil((new Date(customer.nextFollowUp).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                </p>
              </div>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Interest</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="profile">Full Profile</TabsTrigger>
        </TabsList>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Customer Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  {insight.action && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Recommended Action:</p>
                      <p className="text-sm text-blue-700">{insight.action}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Interest */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Interest Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleInterests.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Price Range: ${vehicle.priceRange[0].toLocaleString()} - ${vehicle.priceRange[1].toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                      {vehicle.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Interest Level</span>
                        <span className="text-xs text-gray-600">{vehicle.interestLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${vehicle.interestLevel}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Link href={`/inventory/${vehicle.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getTimelineIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      {event.outcome && (
                        <p className="text-xs text-gray-500 mt-1 italic">Outcome: {event.outcome}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Profile */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}