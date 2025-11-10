/**
 * Customer Dossier - Panel 1
 *
 * "The Past" - Source of truth providing context for AI recommendations
 * - Customer profile with credit score
 * - Financial summary
 * - Vehicle context
 * - Recent activity
 * - Trade-in summary
 */

import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, Separator } from '@repo/ui';
import { Phone, Mail, DollarSign, TrendingUp, Car, MessageSquare } from 'lucide-react';

interface CustomerDossierProps {
  customerId?: string;
}

export function CustomerDossier({ customerId }: CustomerDossierProps) {
  // TODO: Fetch customer data from API
  const customer = {
    name: 'Jane Doe',
    phone: '(555) 123-4567',
    email: 'jane@email.com',
    creditScore: 730,
    status: 'Hot Lead',
    stage: 'Negotiation',
    annualIncome: 75000,
    dti: 28,
    maxPayment: 650,
    preApproved: true,
  };

  const vehicle = {
    name: '2024 Ford F-150 Lariat',
    cost: 32450,
    msrp: 48900,
    daysOnLot: 58,
    margin: 16450,
  };

  const tradeIn = {
    vehicle: '2019 Chevy Silverado',
    value: 22000,
    payoff: 18500,
    equity: 3500,
  };

  const activity = [
    { type: 'message', text: 'Hoping to make a deal today', time: '15 min ago' },
    { type: 'visit', text: 'Showroom visit', time: '2 hours ago' },
    { type: 'test-drive', text: 'Test drive completed', time: 'Yesterday' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Customer Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" fallback="JD" />
            <div className="flex-1">
              <div className="font-semibold text-text-primary">{customer.name}</div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-text-tertiary">FICO</span>
                <Badge variant={customer.creditScore >= 700 ? 'success' : 'warning'}>
                  {customer.creditScore}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Mail className="h-4 w-4" />
              {customer.email}
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="default">{customer.status}</Badge>
            <Badge variant="outline">{customer.stage}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Annual Income</span>
            <span className="font-medium text-text-primary">
              ${customer.annualIncome.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">DTI Ratio</span>
            <span className="font-medium text-text-primary">{customer.dti}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Max Payment</span>
            <span className="font-semibold text-accent-primary">
              ${customer.maxPayment}/mo
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-tertiary">Pre-Approval</span>
            <Badge variant={customer.preApproved ? 'success' : 'outline'}>
              {customer.preApproved ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Vehicle Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="aspect-video bg-surface-muted rounded-md flex items-center justify-center">
            <Car className="h-12 w-12 text-text-tertiary" />
          </div>

          <div className="font-medium text-text-primary">{vehicle.name}</div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-text-tertiary">Cost</div>
              <div className="font-medium text-text-primary">
                ${vehicle.cost.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-text-tertiary">MSRP</div>
              <div className="font-medium text-text-primary">
                ${vehicle.msrp.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-text-tertiary">Days on Lot</div>
              <div className="font-medium text-text-primary">{vehicle.daysOnLot}</div>
            </div>
            <div>
              <div className="text-text-tertiary">Margin</div>
              <div className="font-semibold text-status-success">
                ${vehicle.margin.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade-In Summary */}
      {tradeIn && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trade-In Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-medium text-text-primary">{tradeIn.vehicle}</div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-text-tertiary">Estimated Value</span>
              <span className="font-medium text-text-primary">
                ${tradeIn.value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Payoff</span>
              <span className="font-medium text-text-primary">
                ${tradeIn.payoff.toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-text-tertiary">Net Equity</span>
              <span className="font-semibold text-status-success">
                ${tradeIn.equity.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="mt-0.5">
                <MessageSquare className="h-4 w-4 text-text-tertiary" />
              </div>
              <div className="flex-1 text-sm">
                <div className="text-text-primary">{item.text}</div>
                <div className="text-text-tertiary text-xs">{item.time}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
