import { useState } from 'react';
import { Input, Phone, MessageSquare, ChevronRight, SwipeableCard, PullToRefresh, X, Text } from '@repo/ui';

interface Customer {
  id: string;
  name: string;
  phone: string;
  status: 'hot' | 'warm' | 'cold';
  lastContact: string;
  nextAction: string;
  vehicle: string;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '(555) 123-4567',
    status: 'hot',
    lastContact: '2h ago',
    nextAction: 'Follow up on 2024 Honda Accord',
    vehicle: '2024 Honda Accord',
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '(555) 234-5678',
    status: 'warm',
    lastContact: '1d ago',
    nextAction: 'Send pricing on Toyota Camry',
    vehicle: '2024 Toyota Camry',
  },
  {
    id: '3',
    name: 'Emma Davis',
    phone: '(555) 345-6789',
    status: 'cold',
    lastContact: '3d ago',
    nextAction: 'Check in - financing approved',
    vehicle: '2023 Ford F-150',
  },
];

const statusColors = {
  hot: 'bg-red-500',
  warm: 'bg-orange-500',
  cold: 'bg-blue-500',
};

export function CustomerLens() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const handleArchive = (customerId: string) => {
    console.log('Archive:', customerId);
  };

  const handleCall = (customerId: string) => {
    console.log('Call:', customerId);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="min-h-screen bg-bg-0">
        {/* iOS-style large title header */}
        <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-3">
            <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
              Customers
            </Text>
            <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
              Attention queue for Sales & BDC
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

        {/* Customer list */}
        <div className="px-4 py-2">
          {filteredCustomers.map((customer) => (
            <SwipeableCard
              key={customer.id}
              leftAction={{
                label: 'Archive',
                icon: <X className="w-5 h-5" />,
                color: 'danger',
                onClick: () => handleArchive(customer.id),
              }}
              rightAction={{
                label: 'Call',
                icon: <Phone className="w-5 h-5" />,
                color: 'success',
                onClick: () => handleCall(customer.id),
              }}
            >
              {/* iOS-style list row */}
              <div className="bg-bg-1 active:bg-bg-2/50 transition-colors">
                <div className="px-4 py-3 min-h-[68px] flex items-center gap-3">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[customer.status]}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Text as="h3" variant="bodySemibold" color="primary">
                        {customer.name}
                      </Text>
                      <Text variant="footnote" color="secondary" className="ml-auto flex-shrink-0">
                        {customer.lastContact}
                      </Text>
                    </div>
                    <Text variant="subheadline" color="secondary" truncate="single" className="mb-1 opacity-80">
                      {customer.nextAction}
                    </Text>
                    <Text variant="footnote" color="tertiary" className="opacity-60">
                      {customer.vehicle}
                    </Text>
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
        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-bg-2 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-text-muted/40" />
            </div>
            <Text as="h3" variant="title3" color="primary" className="mb-1">
              No Customers
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
