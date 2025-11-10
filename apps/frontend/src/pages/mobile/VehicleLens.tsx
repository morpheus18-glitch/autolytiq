import { useState } from 'react';
import { Input, TrendingUp, TrendingDown, DollarSign, CheckCircle, ChevronRight, SwipeableCard, PullToRefresh, Text } from '@repo/ui';

interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  status: 'ready' | 'hold' | 'recon';
  price: number;
  marketPrice: number;
  daysInStock: number;
  location?: string;
}

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vin: '1HGBH41JXMN109186',
    year: 2023,
    make: 'Honda',
    model: 'Accord',
    trim: 'EX-L',
    status: 'ready',
    price: 28500,
    marketPrice: 29200,
    daysInStock: 12,
    location: 'Lot A-12',
  },
  {
    id: '2',
    vin: '2FMDK3GC5MBA12345',
    year: 2022,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    status: 'recon',
    price: 42000,
    marketPrice: 43500,
    daysInStock: 3,
    location: 'Service Bay 2',
  },
  {
    id: '3',
    vin: '3GNAXUEV8NL123456',
    year: 2024,
    make: 'Chevrolet',
    model: 'Tahoe',
    status: 'hold',
    price: 58000,
    marketPrice: 57200,
    daysInStock: 5,
    location: 'Showroom',
  },
];

const statusColors = {
  ready: 'bg-green-500',
  hold: 'bg-orange-500',
  recon: 'bg-gray-500',
};

export function VehicleLens() {
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const handleEdit = (vehicleId: string) => {
    console.log('Edit:', vehicleId);
  };

  const handleSell = (vehicleId: string) => {
    console.log('Sell:', vehicleId);
  };

  const filteredVehicles = vehicles.filter((v) =>
    `${v.year} ${v.make} ${v.model} ${v.vin}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriceIndicator = (price: number, marketPrice: number) => {
    const diff = price - marketPrice;
    const percentDiff = (diff / marketPrice) * 100;

    if (Math.abs(percentDiff) < 2) {
      return { icon: null, color: 'text-text-muted', text: 'At market' };
    }
    if (diff < 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-500',
        text: `${Math.abs(percentDiff).toFixed(1)}% below`,
      };
    }
    return {
      icon: TrendingDown,
      color: 'text-red-500',
      text: `${percentDiff.toFixed(1)}% above`,
    };
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="min-h-screen bg-bg-0">
        {/* iOS-style large title header */}
        <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-3">
            <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
              Vehicles
            </Text>
            <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
              Frontline readiness for Inventory & Recon
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

        {/* Vehicle list */}
        <div className="px-4 py-2">
          {filteredVehicles.map((vehicle) => {
            const priceInfo = getPriceIndicator(vehicle.price, vehicle.marketPrice);
            const PriceIcon = priceInfo.icon;

            return (
              <SwipeableCard
                key={vehicle.id}
                leftAction={{
                  label: 'Edit',
                  icon: <DollarSign className="w-5 h-5" />,
                  color: 'primary',
                  onClick: () => handleEdit(vehicle.id),
                }}
                rightAction={{
                  label: 'Sell',
                  icon: <CheckCircle className="w-5 h-5" />,
                  color: 'success',
                  onClick: () => handleSell(vehicle.id),
                }}
              >
                {/* iOS-style list row */}
                <div className="bg-bg-1 active:bg-bg-2/50 transition-colors">
                  <div className="px-4 py-3 min-h-[68px] flex items-center gap-3">
                    {/* Status dot */}
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[vehicle.status]}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <Text as="h3" variant="bodySemibold" color="primary">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Text>
                        <Text variant="footnote" color="secondary" className="ml-auto flex-shrink-0">
                          {vehicle.daysInStock}d
                        </Text>
                      </div>
                      {vehicle.trim && (
                        <Text variant="subheadline" color="secondary" className="mb-1 opacity-80">
                          {vehicle.trim}
                        </Text>
                      )}
                      <div className="flex items-center justify-between">
                        <Text variant="footnote" color="tertiary" className="opacity-60 font-mono">
                          {vehicle.vin}
                        </Text>
                        <div className={`flex items-center gap-1 ${priceInfo.color}`}>
                          {PriceIcon && <PriceIcon className="w-3 h-3" />}
                          <Text as="span" variant="footnote">
                            {priceInfo.text}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Text variant="bodySemibold" color="primary">
                          ${vehicle.price.toLocaleString()}
                        </Text>
                        {vehicle.location && (
                          <Text variant="footnote" color="tertiary" className="opacity-60">
                            {vehicle.location}
                          </Text>
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
            );
          })}
        </div>

        {/* Empty state */}
        {filteredVehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-bg-2 flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-text-muted/40" />
            </div>
            <Text as="h3" variant="title3" color="primary" className="mb-1">
              No Vehicles
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
