import Calendar from "../ui/calendar";

export default function CalendarOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Schedule</h1>
          <p className="text-[var(--color-text-sub)] text-sm mt-1">Manage your interviews and candidate meetings.</p>
        </div>
      </div>
      
      {/* Calendar Demo Container */}
      <div className="flex justify-center mt-8 px-4">
        <Calendar />
      </div>
    </div>
  );
}
