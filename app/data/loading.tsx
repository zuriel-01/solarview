export default function DataLoading() {
  return (
    <div className="min-h-[420px] animate-pulse space-y-6" aria-label="Loading dashboard">
      <div className="h-9 w-64 rounded-lg bg-slate-300" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-28 rounded-2xl bg-white" />
        <div className="h-28 rounded-2xl bg-white" />
        <div className="h-28 rounded-2xl bg-white" />
      </div>
      <div className="h-80 rounded-2xl bg-white" />
    </div>
  );
}
