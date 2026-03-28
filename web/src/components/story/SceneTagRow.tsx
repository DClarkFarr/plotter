import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import type { Tag } from "../../api/types";
import IconDelete from "~icons/mdi/delete";
import IconChevronDown from "~icons/mdi/chevron-down";
import IconSourceBranch from "~icons/mdi/source-branch";

export type SceneTagRowProps = {
  tag: Tag;
  checked: boolean;
  onToggle: (tagId: string) => void;
  selectedVariant?: string;
  onSelectVariant?: (tagId: string, variant: string) => void;
  onConvertToVariant?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
  onAddVariant?: (tagId: string, variant: string) => void;
  onDeleteVariant?: (tagId: string, variant: string) => void;
  isDeleting?: boolean;
  isUpdatingVariant?: boolean;
  isAddingVariant?: boolean;
  deletingVariant?: string;
};

export const SceneTagRow = ({
  tag,
  checked,
  onToggle,
  selectedVariant,
  onSelectVariant,
  onConvertToVariant,
  onDelete,
  onAddVariant,
  onDeleteVariant,
  isDeleting,
  isUpdatingVariant,
  isAddingVariant,
  deletingVariant,
}: SceneTagRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const trimmedVariantName = useMemo(
    () => newVariantName.trim(),
    [newVariantName],
  );

  const handleConvertToVariant = () => {
    onConvertToVariant?.(tag);
    setIsExpanded(true);
  };

  const handleToggle = () => {
    onToggle(tag.id);
    if (!checked) {
      setIsExpanded(true);
    }
  };

  const handleVariantEnterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && trimmedVariantName) {
      onAddVariant?.(tag.id, trimmedVariantName);
      setNewVariantName("");
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg">
        <Label className="text-sm text-slate-700 flex items-center gap-3">
          <Checkbox checked={checked} onChange={handleToggle} />
          <div
            className="color-preview w-4 h-4 border border-1 border-black rounded-full bg-[var(--tag-color)]"
            style={{ "--tag-color": tag.color }}
          ></div>
          <div>{tag.name}</div>
        </Label>
        {tag.variant && selectedVariant && !isExpanded ? (
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {selectedVariant}
          </span>
        ) : null}
        <div className="ml-auto -my-2 -mr-3 p-1 bg-gray-100 rounded-l-lg text-sm button-group">
          <div>
            {tag.variant ? (
              <Button
                type="button"
                color="gray"
                size="xs"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                <span>{tag.variants.length}</span>
                <span>
                  <IconChevronDown className="ml-1" />
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                color="sky"
                size="xs"
                onClick={handleConvertToVariant}
                disabled={isUpdatingVariant}
              >
                <IconSourceBranch />
              </Button>
            )}
          </div>
          {onDelete ? (
            <div>
              <Button
                type="button"
                color="red"
                size="xs"
                onClick={() => onDelete(tag)}
                disabled={isDeleting}
              >
                <IconDelete />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {tag.variant && isExpanded ? (
        <div className="border-t border-slate-200 px-3 py-2">
          {tag.variants.length === 0 ? (
            <p className="text-xs text-slate-500">No variants yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tag.variants.map((variant) => (
                <div
                  key={variant}
                  className="flex items-center gap-4 text-sm text-slate-700"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`variant-${tag.id}`}
                      checked={selectedVariant === variant}
                      onChange={() => onSelectVariant?.(tag.id, variant)}
                    />
                    <span>{variant}</span>
                  </label>
                  {onDeleteVariant ? (
                    <div className="ml-auto">
                      <Button
                        type="button"
                        color="red"
                        size="xs"
                        onClick={() => onDeleteVariant(tag.id, variant)}
                        disabled={deletingVariant === variant}
                      >
                        <IconDelete />
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {onAddVariant ? (
            <div className="mt-3 flex items-center gap-2">
              <TextInput
                value={newVariantName}
                onChange={(event) => setNewVariantName(event.target.value)}
                onKeyUp={handleVariantEnterKey}
                placeholder="New variant"
                className="flex-1"
              />
              <div className="pl-2">
                <Button
                  type="button"
                  size="xs"
                  onClick={() => {
                    if (!trimmedVariantName) {
                      return;
                    }
                    onAddVariant(tag.id, trimmedVariantName);
                    setNewVariantName("");
                  }}
                  disabled={!trimmedVariantName || isAddingVariant}
                >
                  Add
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
