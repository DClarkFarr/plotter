import IconLeadPencil from "~icons/mdi/lead-pencil";
import { Portal } from "../components/helpers/Portal";

export function StoryPage() {
  return (
    <main className="h-full">
      <Portal wrapperId="dashboard-topbar">
        <div className="story-controls flex gap-4 items-center">
          <div>[toggle view icons]</div>
          <div>[toggle card size icons]</div>
          <div>[filter icon]</div>
        </div>
      </Portal>
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Story Details
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 flex gap-2">
          <span>Story title here</span>
          <span>
            <IconLeadPencil className="ml-2 text-sm opacity-50" />
          </span>
        </h1>
      </div>
    </main>
  );
}
