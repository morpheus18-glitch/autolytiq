export default function DealershipOverviewWidget() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Dealership Overview</h3>
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-600">Active Deals</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600">Closed This Month</div>
        </div>
      </div>
    </div>
  );
}
