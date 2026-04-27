import Select, {
  components,
  type OptionProps,
  type SingleValueProps,
} from "react-select";
import type { Plot } from "../../api/types";

export type ScenePlotOption = {
  value: string;
  label: string;
  plot: Plot;
};

interface ScenePlotSelectProps {
  value: Plot | null;
  options: Plot[];
  isLoading?: boolean;
  isDisabled?: boolean;
  onChange: (plot: Plot | null) => void;
  placeholder?: string;
}

const PlotColorDot = ({ color }: { color: string }) => (
  <span
    className="inline-block h-3 w-3 rounded-full border border-slate-300"
    style={{ backgroundColor: color }}
    aria-hidden="true"
  />
);

const Option = (props: OptionProps<ScenePlotOption>) => {
  const { plot } = props.data;

  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <PlotColorDot color={plot.color} />
        <div className="text-slate-700">{plot.title}</div>
        <div className="text-xs text-slate-500">
          - Plot {plot.horizontalIndex + 1}
        </div>
      </div>
    </components.Option>
  );
};

const SingleValue = (props: SingleValueProps<ScenePlotOption>) => {
  const { plot } = props.data;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <PlotColorDot color={plot.color} />
        <div className="text-slate-700">{plot.title}</div>
        <div className="text-xs text-slate-500">
          - Plot {plot.horizontalIndex + 1}
        </div>
      </div>
    </components.SingleValue>
  );
};

export const ScenePlotSelect = ({
  value,
  options,
  isLoading,
  isDisabled,
  onChange,
  placeholder = "Select plot",
}: ScenePlotSelectProps) => {
  const selectOptions: ScenePlotOption[] = options.map((plot) => ({
    value: plot.id,
    label: `${plot.title} - Plot ${plot.horizontalIndex + 1}`,
    plot,
  }));

  const selectedOption = value
    ? (selectOptions.find((option) => option.value === value.id) ?? null)
    : null;

  return (
    <Select
      inputId="scene-plot-select"
      isSearchable
      isLoading={isLoading}
      isDisabled={isDisabled}
      value={selectedOption}
      options={selectOptions}
      placeholder={placeholder}
      onChange={(next) =>
        onChange(next ? (next as ScenePlotOption).plot : null)
      }
      components={{ Option, SingleValue }}
      noOptionsMessage={() => "No plots yet"}
      unstyled
      classNames={{
        control: () =>
          "border border-slate-200 rounded-md px-2 py-2 bg-white focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-200",
        menu: () =>
          "mt-2 border border-slate-200 rounded-md bg-white shadow-lg overflow-hidden",
        option: (state) =>
          `px-3 py-2 cursor-pointer ${state.isFocused ? "bg-slate-100" : "bg-white"}`,
        placeholder: () => "text-sm text-slate-400",
        singleValue: () => "text-sm",
        valueContainer: () => "gap-2",
        indicatorsContainer: () => "gap-1 text-slate-400",
        clearIndicator: () => "hover:text-slate-600",
        dropdownIndicator: () => "hover:text-slate-600",
        input: () => "text-sm text-slate-700",
      }}
    />
  );
};
