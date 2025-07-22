import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Link } from 'wouter';

export function AdvancedAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">Live Data</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="font-bold text-lg">$2.4M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="font-bold text-lg">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="font-bold text-lg">24.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Deal Size</p>
                <p className="font-bold text-lg">$32,400</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehensive Analytics</h3>
        <p className="text-gray-600 mb-4">View detailed analytics and performance metrics</p>
        <Link href="/analytics">
          <Button>Open Full Analytics Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}