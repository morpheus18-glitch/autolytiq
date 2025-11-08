export default function PendingTasksWidget() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Pending Tasks</h3>
      <div className="flex-1">
        <p className="text-center text-gray-500 py-8">No pending tasks</p>
      </div>
    </div>
  );
}
