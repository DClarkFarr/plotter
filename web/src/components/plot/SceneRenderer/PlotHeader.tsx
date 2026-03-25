import { Button, TextInput } from "flowbite-react";
import type { Plot } from "../../../api/types";

export type PlotHeaderProps = {
  plot?: Plot;
  plotIndex: number;
};
export const PlotHeader = ({ plot, plotIndex }: PlotHeaderProps) => {
  if (!plot) {
    return (
      <div className="bg-slate-300 px-4 py-2 h-[150px] flex flex-col justify-center">
        <div className="">
          <TextInput value={`Plot ${plotIndex + 1}`} />
          <Button>Create</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-slate-300 px-4 py-2">
      <div className="text-sm text-slate-500">Plot {plotIndex + 1}</div>
    </div>
  );
};
