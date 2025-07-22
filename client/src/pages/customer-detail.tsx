import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Phone, Mail, MapPin, CreditCard, User, Calendar, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@shared/schema';

export default function CustomerDetail() {
  const { toast } = useToast();
  const { id } = useParams();
  
  const { data: customer, isLoading, error } = useQuery<Customer>({
    queryKey: [`/api/customers/${id}`],
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist or has been removed.</p>
          <Link href="/customers">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {customer.firstName} {customer.lastName}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(customer.status)}>
                {customer.status}
              </Badge>
              <span className="text-gray-500">Customer ID: {customer.id}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Link href={`/showroom-manager?customerId=${customer.id}`}>
            <Button>
              Start Showroom Session
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{customer.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{customer.phone || 'Not provided'}</p>
              </div>
            </div>
            {customer.cellPhone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Cell Phone</p>
                  <p className="text-sm text-gray-600">{customer.cellPhone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-gray-600">
                  {customer.address && customer.city && customer.state
                    ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode || ''}`
                    : 'Not provided'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Sales Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Sales Consultant</p>
              <p className="text-sm text-gray-600">{customer.salesConsultant || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Lead Source</p>
              <p className="text-sm text-gray-600">{customer.leadSource || 'Unknown'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Credit Score</p>
                <p className="text-sm text-gray-600">
                  {customer.creditScore || 'Not provided'}
                </p>
              </div>
            </div>
            {customer.income && (
              <div>
                <p className="text-sm font-medium">Annual Income</p>
                <p className="text-sm text-gray-600">
                  ${customer.income.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Customer Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Customer Created</p>
                  <p className="text-xs text-gray-500">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              {customer.updatedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(customer.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline">
          <Phone className="h-4 w-4 mr-2" />
          Call Customer
        </Button>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Link href={`/deals?customerId=${customer.id}`}>
          <Button variant="outline">
            View Deals
          </Button>
        </Link>
      </div>
    </div>
  );
}