import Select, {
  components,
  type OptionProps,
  type SingleValueProps,
} from "react-select";
import type { Character } from "../../api/types";
import { CharacterAvatar } from "./CharacterAvatar";

export type ScenePovOption = {
  value: string;
  label: string;
  character: Character;
};

interface ScenePovSelectProps {
  value: Character | null;
  options: Character[];
  isLoading?: boolean;
  onChange: (character: Character | null) => void;
  onAddCharacter: () => void;
  placeholder?: string;
}

const Option = (props: OptionProps<ScenePovOption>) => {
  const { character } = props.data;

  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <CharacterAvatar name={character.title} imageUrl={character.imageUrl} />
        <div className="text-sm text-slate-700">{character.title}</div>
      </div>
    </components.Option>
  );
};

const SingleValue = (props: SingleValueProps<ScenePovOption>) => {
  const { character } = props.data;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <CharacterAvatar name={character.title} imageUrl={character.imageUrl} />
        <div className="text-sm text-slate-700">{character.title}</div>
      </div>
    </components.SingleValue>
  );
};

export const ScenePovSelect = ({
  value,
  options,
  isLoading,
  onChange,
  onAddCharacter,
  placeholder = "Select POV",
}: ScenePovSelectProps) => {
  const selectOptions: ScenePovOption[] = options.map((character) => ({
    value: character.id,
    label: character.title,
    character,
  }));

  const selectedOption = value
    ? (selectOptions.find((option) => option.value === value.id) ?? null)
    : null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select
          inputId="scene-pov-select"
          isClearable
          isSearchable
          isLoading={isLoading}
          value={selectedOption}
          options={selectOptions}
          placeholder={placeholder}
          onChange={(next) =>
            onChange(next ? (next as ScenePovOption).character : null)
          }
          components={{ Option, SingleValue }}
          noOptionsMessage={() => "No characters yet"}
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
      </div>
      <button
        type="button"
        onClick={onAddCharacter}
        className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-2 border border-slate-200 rounded-md"
      >
        Add new
      </button>
    </div>
  );
};
