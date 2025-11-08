export default function TodayAppointmentsWidget() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Today's Appointments</h3>
      <div className="flex-1">
        <p className="text-center text-gray-500 py-8">No appointments today</p>
      </div>
    </div>
  );
}
