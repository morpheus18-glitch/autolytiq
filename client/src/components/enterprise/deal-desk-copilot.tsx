import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  Calculator,
  FileText,
  User,
  Car,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Target,
  Shield,
  Zap,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { Link } from 'wouter';

interface DealStructure {
  vehiclePrice: number;
  tradeInValue: number;
  downPayment: number;
  loanAmount: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  totalFinanced: number;
  fiProducts: {
    warranty: number;
    gap: number;
    paintProtection: number;
    maintenance: number;
  };
  dealerProfit: number;
  grossProfit: number;
}

interface FinanceRecommendation {
  type: 'lender' | 'structure' | 'product' | 'incentive';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  value?: number;
  confidence: number;
}

interface ComplianceCheck {
  category: 'lending' | 'disclosure' | 'documentation' | 'regulation';
  requirement: string;
  status: 'compliant' | 'warning' | 'violation';
  details: string;
  action?: string;
}

interface DealStatus {
  stage: 'structuring' | 'financing' | 'approval' | 'documentation' | 'delivery';
  progress: number;
  nextSteps: string[];
  blockers: string[];
  estimatedCloseDate: string;
}

export function DealDeskCopilot({ dealId }: { dealId?: string }) {
  // Mock deal data - in real app this would come from API
  const [dealStructure] = useState<DealStructure>({
    vehiclePrice: 32500,
    tradeInValue: 8500,
    downPayment: 3000,
    loanAmount: 21000,
    apr: 4.2,
    termMonths: 60,
    monthlyPayment: 389,
    totalFinanced: 23340,
    fiProducts: {
      warranty: 2100,
      gap: 695,
      paintProtection: 1200,
      maintenance: 1800,
    },
    dealerProfit: 3500,
    grossProfit: 7295,
  });

  const [recommendations] = useState<FinanceRecommendation[]>([
    {
      type: 'structure',
      title: 'Optimize Loan Structure',
      description: 'Consider 72-month term to reduce payment to $342/month. Increases bank profit by $450.',
      impact: 'positive',
      value: 450,
      confidence: 87,
    },
    {
      type: 'product',
      title: 'GAP Insurance Opportunity',
      description: 'Customer has minimal down payment. GAP insurance highly recommended for loan protection.',
      impact: 'positive',
      value: 695,
      confidence: 92,
    },
    {
      type: 'lender',
      title: 'Rate Enhancement Available',
      description: 'Customer qualifies for 3.9% APR with XYZ Credit Union. Save customer $12/month.',
      impact: 'positive',
      value: 720,
      confidence: 78,
    },
    {
      type: 'incentive',
      title: 'Manufacturer Rebate Alert',
      description: 'Customer may qualify for $1,000 recent graduate rebate. Verify eligibility.',
      impact: 'positive',
      value: 1000,
      confidence: 65,
    },
  ]);

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      category: 'lending',
      requirement: 'Truth in Lending Disclosure',
      status: 'compliant',
      details: 'APR and payment terms properly disclosed',
    },
    {
      category: 'documentation',
      requirement: 'Customer Income Verification',
      status: 'warning',
      details: 'Pay stubs received but employment verification pending',
      action: 'Contact employer HR department',
    },
    {
      category: 'regulation',
      requirement: 'Equal Credit Opportunity Act',
      status: 'compliant',
      details: 'No prohibited factors considered in credit decision',
    },
    {
      category: 'disclosure',
      requirement: 'F&I Product Disclosure',
      status: 'warning',
      details: 'Extended warranty terms need customer initial',
      action: 'Obtain customer signature on warranty disclosure',
    },
  ]);

  const [dealStatus] = useState<DealStatus>({
    stage: 'financing',
    progress: 65,
    nextSteps: [
      'Complete employment verification',
      'Finalize F&I product selection',
      'Submit final credit application',
      'Prepare delivery documents',
    ],
    blockers: [
      'Pending employment verification from customer employer',
    ],
    estimatedCloseDate: '2024-01-25',
  });

  const getImpactColor = (impact: FinanceRecommendation['impact']) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'violation':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getComplianceIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'violation':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStageProgress = (stage: DealStatus['stage']) => {
    switch (stage) {
      case 'structuring':
        return 20;
      case 'financing':
        return 40;
      case 'approval':
        return 60;
      case 'documentation':
        return 80;
      case 'delivery':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Deal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deal Desk Copilot</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered deal structuring and compliance assistance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={getComplianceColor('compliant')}>
            <Shield className="w-3 h-3 mr-1" />
            Compliant
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Deal #{dealId || 'D-2024-001'}
          </Badge>
        </div>
      </div>

      {/* Deal Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Deal Progress</span>
            </CardTitle>
            <Badge variant="secondary">
              {dealStatus.stage.charAt(0).toUpperCase() + dealStatus.stage.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{dealStatus.progress}%</span>
              </div>
              <Progress value={dealStatus.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps</h4>
                <ul className="space-y-1">
                  {dealStatus.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Blockers</h4>
                {dealStatus.blockers.length > 0 ? (
                  <ul className="space-y-1">
                    {dealStatus.blockers.map((blocker, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>{blocker}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600">No blockers</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Structure Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicle Price</p>
                <p className="text-xl font-bold text-gray-900">${dealStructure.vehiclePrice.toLocaleString()}</p>
              </div>
              <Car className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payment</p>
                <p className="text-xl font-bold text-gray-900">${dealStructure.monthlyPayment}</p>
              </div>
              <Calculator className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                <p className="text-xl font-bold text-gray-900">${dealStructure.grossProfit.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">APR</p>
                <p className="text-xl font-bold text-gray-900">{dealStructure.apr}%</p>
              </div>
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Structure</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Workflow</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-600" />
                <span>AI-Powered Deal Recommendations</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {recommendations.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {rec.value && (
                      <div className="text-sm text-gray-600">
                        Potential Value: <span className="font-medium text-green-600">${rec.value}</span>
                      </div>
                    )}
                    <Button size="sm" variant="outline">
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Apply Recommendation
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Structure */}
        <TabsContent value="structure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Financing Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vehicle Price</span>
                  <span className="text-sm font-medium">${dealStructure.vehiclePrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trade-In Value</span>
                  <span className="text-sm font-medium">-${dealStructure.tradeInValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Down Payment</span>
                  <span className="text-sm font-medium">-${dealStructure.downPayment.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Loan Amount</span>
                    <span className="text-sm font-medium">${dealStructure.loanAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">APR</span>
                  <span className="text-sm font-medium">{dealStructure.apr}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Term</span>
                  <span className="text-sm font-medium">{dealStructure.termMonths} months</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Monthly Payment</span>
                    <span className="text-sm font-medium">${dealStructure.monthlyPayment}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>F&I Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Extended Warranty</span>
                  <span className="text-sm font-medium">${dealStructure.fiProducts.warranty.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GAP Insurance</span>
                  <span className="text-sm font-medium">${dealStructure.fiProducts.gap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Paint Protection</span>
                  <span className="text-sm font-medium">${dealStructure.fiProducts.paintProtection.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maintenance Plan</span>
                  <span className="text-sm font-medium">${dealStructure.fiProducts.maintenance.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Total F&I</span>
                    <span className="text-sm font-medium">
                      ${Object.values(dealStructure.fiProducts).reduce((a, b) => a + b, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Gross Profit</span>
                    <span className="text-sm font-medium text-green-600">${dealStructure.grossProfit.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Compliance Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceChecks.map((check, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={getComplianceColor(check.status).split(' ')[0]}>
                        {getComplianceIcon(check.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{check.requirement}</h4>
                        <p className="text-sm text-gray-600 mt-1">{check.details}</p>
                      </div>
                    </div>
                    <Badge className={getComplianceColor(check.status)}>
                      {check.status}
                    </Badge>
                  </div>
                  
                  {check.action && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Action Required:</p>
                      <p className="text-sm text-yellow-700">{check.action}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow */}
        <TabsContent value="workflow" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Purchase Agreement
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <Calculator className="w-4 h-4 mr-2" />
                  Recalculate Payments
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Submit Credit Application
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Contact Customer
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Document Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Credit Application</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Driver's License Copy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Employment Verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Insurance Information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Purchase Agreement</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}