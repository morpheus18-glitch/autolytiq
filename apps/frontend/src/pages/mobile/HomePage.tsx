import { useNavigate } from 'react-router-dom';
import { Users, Car, FileText, ChevronRight, Text } from '@repo/ui';

const lenses = [
  {
    id: 'customer',
    title: 'Customer Lens',
    description: 'Attention Queue - Sales & BDC',
    icon: Users,
    path: '/home/customer',
    color: 'bg-blue-500',
  },
  {
    id: 'vehicle',
    title: 'Vehicle Lens',
    description: 'Frontline Readiness - Inventory',
    icon: Car,
    path: '/home/vehicle',
    color: 'bg-green-500',
  },
  {
    id: 'deal',
    title: 'Deal Lens',
    description: 'Funding Board - F&I',
    icon: FileText,
    path: '/home/deal',
    color: 'bg-purple-500',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-0">
      {/* iOS-style large title header */}
      <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
        <div className="px-4 pt-4 pb-3">
          <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
            AutolytiQ
          </Text>
          <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
            Enterprise Performance Console
          </Text>
        </div>
        <div className="h-px bg-border-base/20" />
      </div>

      {/* Lens selector list */}
      <div className="px-4 py-2">
        {lenses.map((lens, index) => {
          const Icon = lens.icon;
          const isLast = index === lenses.length - 1;

          return (
            <div key={lens.id}>
              {/* iOS-style list row */}
              <button
                onClick={() => navigate(lens.path)}
                className="w-full bg-bg-1 active:bg-bg-2/50 transition-colors"
              >
                <div className="px-4 py-3 min-h-[68px] flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${lens.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <Text as="h3" variant="bodySemibold" color="primary" className="mb-0.5">
                      {lens.title}
                    </Text>
                    <Text variant="subheadline" color="secondary" className="opacity-80">
                      {lens.description}
                    </Text>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
                </div>

                {/* Inset separator */}
                {!isLast && <div className="h-px bg-border-base/20 ml-[58px]" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick stats section */}
      <div className="px-4 py-6">
        <Text as="h2" variant="title2" color="primary" className="mb-3 px-4">
          Today's Overview
        </Text>

        <div className="bg-bg-1 rounded-2xl overflow-hidden">
          {/* Stat rows */}
          <div className="px-4 py-3 min-h-[60px] flex items-center justify-between">
            <Text variant="body" color="primary">Active Customers</Text>
            <Text variant="title3" color="primary" className="text-blue-500 font-bold">12</Text>
          </div>
          <div className="h-px bg-border-base/20 ml-4" />

          <div className="px-4 py-3 min-h-[60px] flex items-center justify-between">
            <Text variant="body" color="primary">Ready Vehicles</Text>
            <Text variant="title3" color="primary" className="text-green-500 font-bold">24</Text>
          </div>
          <div className="h-px bg-border-base/20 ml-4" />

          <div className="px-4 py-3 min-h-[60px] flex items-center justify-between">
            <Text variant="body" color="primary">Pending Deals</Text>
            <Text variant="title3" color="primary" className="text-purple-500 font-bold">8</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
