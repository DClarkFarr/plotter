export function StoryLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-7 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-28 rounded bg-slate-200" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-20 rounded bg-slate-200" />
          <div className="h-20 rounded bg-slate-200" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-28 rounded bg-slate-200" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-24 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
