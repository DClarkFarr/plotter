export const StoryFormLoading = () => {
  return (
    <div className="p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-8 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="h-24 w-full rounded bg-slate-100" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 rounded bg-slate-200" />
        <div className="h-8 w-full rounded bg-slate-100" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="h-24 w-full rounded bg-slate-100" />
      </div>
    </div>
  );
};
