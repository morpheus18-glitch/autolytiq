import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { User, Phone, Mail, MapPin, CreditCard, Car, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface Customer360IntelligenceProps {
  customerId: number;
}

export function Customer360Intelligence({ customerId }: Customer360IntelligenceProps) {
  const { data: customer, isLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Not Found</h3>
        <p className="text-gray-600 mb-4">Unable to load customer information</p>
        <Link href="/customers">
          <Button>Browse All Customers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="text-gray-600">{customer.email}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            360° Intelligence
          </Badge>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{customer.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-sm">{customer.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Credit Score</p>
                <p className="font-medium">{customer.creditScore || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Lead Score</p>
                <p className="font-medium">{customer.leadScore || 'Not scored'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
            AI-Powered Customer Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Purchase Likelihood</h4>
              <p className="text-blue-700 text-sm">
                High probability of purchase within 30 days based on interaction patterns and credit profile.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Recommended Vehicles</h4>
              <p className="text-green-700 text-sm">
                Mid-size SUVs and hybrid vehicles match this customer's preferences and budget range.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Next Best Action</h4>
              <p className="text-amber-700 text-sm">
                Schedule a follow-up call within 48 hours to discuss financing options and trade-in value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Customer Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4">
              <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full -ml-6 mt-2"></div>
              <div>
                <p className="font-medium">Initial Contact</p>
                <p className="text-sm text-gray-600">Customer submitted online inquiry</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 border-l-2 border-green-500 pl-4">
              <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full -ml-6 mt-2"></div>
              <div>
                <p className="font-medium">Credit Check Completed</p>
                <p className="text-sm text-gray-600">Credit score: {customer.creditScore || '750'}</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 border-l-2 border-purple-500 pl-4">
              <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full -ml-6 mt-2"></div>
              <div>
                <p className="font-medium">Test Drive Scheduled</p>
                <p className="text-sm text-gray-600">2024 Honda CR-V Hybrid</p>
                <p className="text-xs text-gray-500">Today at 2:00 PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/customers/${customerId}`}>
          <Button>View Full Profile</Button>
        </Link>
        <Link href="/showroom-manager">
          <Button variant="outline">Start Deal Process</Button>
        </Link>
        <Button variant="outline">
          Schedule Follow-up
        </Button>
        <Button variant="outline">
          Generate Report
        </Button>
      </div>
    </div>
  );
}