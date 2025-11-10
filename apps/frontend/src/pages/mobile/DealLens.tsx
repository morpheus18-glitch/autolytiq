import { useState } from 'react';
import { Input, AlertCircle, CheckCircle, DollarSign, ChevronRight, SwipeableCard, PullToRefresh, X, Text } from '@repo/ui';

interface Deal {
  id: string;
  dealNumber: string;
  customer: string;
  vehicle: string;
  status: 'pending' | 'approved' | 'funded' | 'blocked';
  lender: string;
  amount: number;
  stipCount: number;
  daysOpen: number;
  blockers?: string[];
}

// Mock data
const mockDeals: Deal[] = [
  {
    id: '1',
    dealNumber: 'D-2024-001',
    customer: 'John Doe',
    vehicle: '2023 Honda Accord',
    status: 'approved',
    lender: 'Wells Fargo Auto',
    amount: 28500,
    stipCount: 2,
    daysOpen: 3,
  },
  {
    id: '2',
    dealNumber: 'D-2024-002',
    customer: 'Jane Smith',
    vehicle: '2022 Ford F-150',
    status: 'pending',
    lender: 'Chase Auto Finance',
    amount: 42000,
    stipCount: 5,
    daysOpen: 7,
  },
  {
    id: '3',
    dealNumber: 'D-2024-003',
    customer: 'Bob Johnson',
    vehicle: '2024 Chevrolet Tahoe',
    status: 'blocked',
    lender: 'Capital One Auto',
    amount: 58000,
    stipCount: 0,
    daysOpen: 12,
    blockers: ['Missing title', 'Insurance verification'],
  },
];

const statusColors = {
  pending: 'bg-orange-500',
  approved: 'bg-green-500',
  funded: 'bg-blue-500',
  blocked: 'bg-red-500',
};

export function DealLens() {
  const [deals] = useState<Deal[]>(mockDeals);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const handleReject = (dealId: string) => {
    console.log('Reject:', dealId);
  };

  const handleApprove = (dealId: string) => {
    console.log('Approve:', dealId);
  };

  const filteredDeals = deals.filter((d) =>
    `${d.dealNumber} ${d.customer} ${d.vehicle}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="min-h-screen bg-bg-0">
        {/* iOS-style large title header */}
        <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-3">
            <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
              Deals
            </Text>
            <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
              Funding board for F&I & Accounting
            </Text>

            {/* iOS-style search bar */}
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-bg-2/80 border-0 rounded-xl px-3 text-[17px] placeholder:text-text-muted/50 focus:bg-bg-2"
            />
          </div>
          <div className="h-px bg-border-base/20" />
        </div>

        {/* Deal list */}
        <div className="px-4 py-2">
          {filteredDeals.map((deal) => (
            <SwipeableCard
              key={deal.id}
              leftAction={{
                label: 'Reject',
                icon: <X className="w-5 h-5" />,
                color: 'danger',
                onClick: () => handleReject(deal.id),
              }}
              rightAction={{
                label: 'Approve',
                icon: <CheckCircle className="w-5 h-5" />,
                color: 'success',
                onClick: () => handleApprove(deal.id),
              }}
            >
              {/* iOS-style list row */}
              <div className="bg-bg-1 active:bg-bg-2/50 transition-colors">
                <div className="px-4 py-3 min-h-[68px] flex items-center gap-3">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[deal.status]}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Text as="h3" variant="bodySemibold" color="primary">
                        {deal.dealNumber}
                      </Text>
                      <Text variant="footnote" color="secondary" className="ml-auto flex-shrink-0">
                        {deal.daysOpen}d open
                      </Text>
                    </div>
                    <Text variant="subheadline" color="secondary" truncate="single" className="mb-1 opacity-80">
                      {deal.customer} • {deal.vehicle}
                    </Text>
                    <div className="flex items-center justify-between">
                      <Text variant="footnote" color="tertiary" className="opacity-60">
                        {deal.lender}
                      </Text>
                      {deal.stipCount > 0 && (
                        <Text variant="footnote" className="text-orange-500">
                          {deal.stipCount} stip{deal.stipCount > 1 ? 's' : ''}
                        </Text>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <Text variant="bodySemibold" color="primary">
                        ${deal.amount.toLocaleString()}
                      </Text>
                      {deal.blockers && deal.blockers.length > 0 && (
                        <div className="flex items-center gap-1 text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          <Text as="span" variant="footnote">
                            {deal.blockers.length} blocker{deal.blockers.length > 1 ? 's' : ''}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
                </div>

                {/* Inset separator */}
                <div className="h-px bg-border-base/20 ml-14" />
              </div>
            </SwipeableCard>
          ))}
        </div>

        {/* Empty state */}
        {filteredDeals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-bg-2 flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-text-muted/40" />
            </div>
            <Text as="h3" variant="title3" color="primary" className="mb-1">
              No Deals
            </Text>
            <Text variant="subheadline" color="secondary" align="center" className="opacity-70 max-w-[280px]">
              Try adjusting your search or check back later
            </Text>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
