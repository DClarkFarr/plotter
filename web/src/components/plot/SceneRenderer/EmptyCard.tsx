import type { EmptyRendererProps } from "../plot.types";
import IconPlus from "~icons/mdi/plus";

export const EmptyCard = ({ isDisabled }: EmptyRendererProps) => {
  return (
    <div
      className={`card card--empty border border-slate-300 radius-2 bg-white self-stretch ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <div className="p-6 flex flex-col gap-4 items-center justify-center h-full">
        <div className="text-lg text-slate-500">Create scene</div>
        <div>
          <button
            className={`text-2xl text-slate-600 p-4 ${
              isDisabled
                ? "cursor-not-allowed"
                : "cursor-pointer hover:text-slate-800 hover:bg-gray-200"
            }`}
            type="button"
            aria-disabled={isDisabled}
            disabled={isDisabled}
          >
            <IconPlus />
          </button>
        </div>
      </div>
    </div>
  );
};
