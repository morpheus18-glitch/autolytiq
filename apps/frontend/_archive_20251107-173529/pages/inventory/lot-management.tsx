import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  MapPin,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Move
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Input } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';

interface LotPosition {
  id: string;
  section: string;
  row: string;
  space: number;
  vehicleId?: number;
  status: 'occupied' | 'available' | 'reserved' | 'maintenance';
}

export default function LotManagement() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSection, setSelectedSection] = useState('all');
  
  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const { data: lotData = [] } = useQuery({
    queryKey: ['/api/lot/positions'],
    queryFn: () => {
      // Mock lot data - in real app this would come from backend
      return Promise.resolve([
        { id: 'a1-1', section: 'A1', row: '1', space: 1, vehicleId: 1, status: 'occupied' },
        { id: 'a1-2', section: 'A1', row: '1', space: 2, vehicleId: 2, status: 'occupied' },
        { id: 'a1-3', section: 'A1', row: '1', space: 3, status: 'available' },
        { id: 'a1-4', section: 'A1', row: '1', space: 4, status: 'reserved' },
        { id: 'a2-1', section: 'A2', row: '1', space: 1, vehicleId: 3, status: 'occupied' },
        { id: 'a2-2', section: 'A2', row: '1', space: 2, status: 'maintenance' },
        // Add more mock positions...
      ] as LotPosition[]);
    }
  });

  const sections = ['A1', 'A2', 'B1', 'B2', 'Service', 'Display'];
  const occupiedSpaces = lotData.filter(pos => pos.status === 'occupied').length;
  const totalSpaces = lotData.length || 150; // Mock total
  const utilizationRate = (occupiedSpaces / totalSpaces) * 100;

  const getLotStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-blue-500';
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVehicleByPosition = (vehicleId?: number) => {
    return (vehicles as any[]).find((v: any) => v.id === vehicleId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lot Management</h1>
          <p className="text-gray-600">Manage vehicle positioning and lot utilization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Move className="w-4 h-4 mr-2" />
            Move Vehicle
          </Button>
          <Button size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            Assign Position
          </Button>
        </div>
      </div>

      {/* Lot Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spaces</p>
                <p className="text-2xl font-bold text-gray-900">{totalSpaces}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-green-600">{occupiedSpaces}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-blue-600">{totalSpaces - occupiedSpaces}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{utilizationRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search by VIN, make, model..." className="pl-10" />
          </div>
        </div>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map(section => (
              <SelectItem key={section} value={section}>{section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            List
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visual">Visual Layout</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Movement History</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Lot Status Legend</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Maintenance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lot Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sections.map(section => (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="text-lg">Section {section}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {lotData
                      .filter(pos => selectedSection === 'all' || pos.section === section)
                      .slice(0, 25) // Show first 25 spaces per section
                      .map(position => {
                        const vehicle = getVehicleByPosition(position.vehicleId);
                        
                        return (
                          <div
                            key={position.id}
                            className={`
                              relative w-12 h-16 rounded border-2 cursor-pointer transition-all hover:scale-105
                              ${getLotStatusColor(position.status)} ${
                                position.status === 'occupied' ? 'border-gray-300' : 'border-gray-400'
                              }
                            `}
                            title={
                              vehicle 
                                ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin})`
                                : `${position.section}-${position.row}-${position.space} (${position.status})`
                            }
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              {position.status === 'occupied' ? (
                                <Car className="w-4 h-4 text-white" />
                              ) : (
                                <span className="text-xs text-white font-medium">
                                  {position.space}
                                </span>
                              )}
                            </div>
                            {vehicle && (
                              <div className="absolute -bottom-1 left-0 right-0 bg-white text-xs text-center px-1 rounded-b border-t">
                                {vehicle.stockNumber || vehicle.id}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Days on Lot Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">0-30 days</span>
                    <Badge variant="secondary">12 vehicles</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">31-60 days</span>
                    <Badge variant="secondary">8 vehicles</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">61-90 days</span>
                    <Badge variant="secondary">5 vehicles</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">90+ days</span>
                    <Badge variant="destructive">3 vehicles</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map(section => {
                    const sectionSpaces = lotData.filter(pos => pos.section === section);
                    const occupiedInSection = sectionSpaces.filter(pos => pos.status === 'occupied').length;
                    const utilization = sectionSpaces.length > 0 ? (occupiedInSection / sectionSpaces.length) * 100 : 0;
                    
                    return (
                      <div key={section} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Section {section}</span>
                          <span>{utilization.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vehicle Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { vehicle: '2023 Honda Civic', from: 'A1-5', to: 'Display-1', time: '2 hours ago', reason: 'Moved to display lot' },
                  { vehicle: '2022 Toyota Camry', from: 'B2-12', to: 'A1-3', time: '5 hours ago', reason: 'Customer test drive return' },
                  { vehicle: '2024 Ford F-150', from: 'Service-2', to: 'A2-8', time: '1 day ago', reason: 'Service completed' },
                ].map((movement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Move className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{movement.vehicle}</p>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{movement.from} → {movement.to}</p>
                      <p className="text-xs text-gray-500">{movement.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}