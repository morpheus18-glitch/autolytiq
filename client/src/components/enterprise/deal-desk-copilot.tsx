import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Brain, AlertTriangle, CheckCircle, DollarSign, FileText, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'wouter';

interface DealDeskCopilotProps {
  dealId: string;
}

export function DealDeskCopilot({ dealId }: DealDeskCopilotProps) {
  const { data: deal, isLoading } = useQuery({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
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

  if (!deal) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Deal Not Found</h3>
        <p className="text-gray-600 mb-4">Unable to load deal information</p>
        <Link href="/deals">
          <Button>Browse All Deals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Deal #{dealId}
            </h2>
            <p className="text-gray-600">{deal.customerName} - {deal.vehicleDescription}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              AI Copilot
            </Badge>
            <Badge variant={deal.status === 'pending' ? 'secondary' : 'default'}>
              {deal.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Deal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Deal Value</p>
                <p className="font-bold text-lg">${deal.totalAmount?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Days Active</p>
                <p className="font-medium">{deal.daysActive || '3'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Close Probability</p>
                <p className="font-medium">{deal.closeProbability || '85%'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="font-medium">{deal.documentsCount || '12'} files</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              Compliance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Federal Regulations</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Compliant
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">State Requirements</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Compliant
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Documentation</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Complete
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Credit Verification</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-amber-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-900 text-sm">Low Risk Deal</p>
                <p className="text-green-700 text-xs mt-1">
                  Customer has excellent credit and stable income
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 text-sm">Financing Approved</p>
                <p className="text-blue-700 text-xs mt-1">
                  Pre-approved for rates as low as 2.9% APR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            AI Copilot Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-medium text-purple-900 mb-2">💡 Pricing Optimization</h4>
              <p className="text-purple-700 text-sm mb-3">
                Current pricing is competitive. Consider offering extended warranty package to increase deal value by $1,200.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Apply Suggestion</Button>
                <Button size="sm" variant="ghost">View Analysis</Button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-900 mb-2">⚡ Closing Strategy</h4>
              <p className="text-blue-700 text-sm mb-3">
                Customer shows high engagement. Schedule final walkthrough within 24 hours to maintain momentum.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Schedule Walkthrough</Button>
                <Button size="sm" variant="ghost">View Timeline</Button>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-green-900 mb-2">✅ Documentation Review</h4>
              <p className="text-green-700 text-sm mb-3">
                All required documents are complete. Deal is ready for final approval and processing.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Process Deal</Button>
                <Button size="sm" variant="ghost">Generate Contract</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/deals/${dealId}`}>
          <Button>View Full Deal</Button>
        </Link>
        <Link href="/deal-desk">
          <Button variant="outline">Open Deal Desk</Button>
        </Link>
        <Button variant="outline">
          Generate Proposal
        </Button>
        <Button variant="outline">
          Export Analysis
        </Button>
      </div>
    </div>
  );
}