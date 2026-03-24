import type { EmptyRendererProps } from "../plot.types";
import IconPlus from "~icons/mdi/plus";

export const EmptyCard = (_props: EmptyRendererProps) => {
  return (
    <div className="card card--empty border border-slate-300 radius-2 bg-white h-[200px]">
      <div className="p-6 flex flex-col gap-4 items-center justify-center h-full">
        <div className="text-lg text-slate-500">Create scene</div>
        <div>
          <button className="cursor-pointer text-2xl text-slate-600 hover:text-slate-800 p-4 hover:bg-gray-200">
            <IconPlus />
          </button>
        </div>
      </div>
    </div>
  );
};
