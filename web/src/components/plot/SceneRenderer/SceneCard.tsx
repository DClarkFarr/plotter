import type { SceneRendererProps } from "../plot.types";

export const SceneCard = (_props: SceneRendererProps) => {
  return (
    <div className="card card--empty border border-slate-300 radius-2 h-[200px]">
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-sm text-slate-500">Story scene</div>
        <div></div>
      </div>
    </div>
  );
};
