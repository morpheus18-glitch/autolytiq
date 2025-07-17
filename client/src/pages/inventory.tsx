import InventoryTable from "@/components/inventory-table";

export default function Inventory() {
  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
            <p className="text-gray-500">Manage your vehicle inventory</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <InventoryTable />
      </main>
    </div>
  );
}
