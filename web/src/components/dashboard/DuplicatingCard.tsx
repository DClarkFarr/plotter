import { Spinner } from "flowbite-react";

export function DuplicatingCard() {
  return (
    <div className="flex h-36 items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
      <Spinner size="sm" />
      <span>Duplicating…</span>
    </div>
  );
}
