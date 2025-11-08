import { useQuery } from '@tanstack/react-query';

async function fetchActiveDeals() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/deals?status=ACTIVE&limit=5', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export default function ActiveDealsWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['active-deals-widget'],
    queryFn: fetchActiveDeals,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading deals...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error loading deals</div>;
  }

  const deals = data?.data || [];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Active Deals</h3>
      <div className="flex-1 space-y-3 overflow-auto">
        {deals.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No active deals</p>
        ) : (
          deals.map((deal: any) => (
            <div key={deal.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="font-medium text-gray-900">
                {deal.customer?.firstName} {deal.customer?.lastName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {deal.vehicle?.year} {deal.vehicle?.make} {deal.vehicle?.model}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Status: <span className="font-medium">{deal.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
