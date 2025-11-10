export default function SystemHealthWidget() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">System Health</h3>
      <div className="flex-1">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Backend API</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Operational</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Database</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
