import { Button, TextInput } from "flowbite-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import type { Tag } from "../../api/types";
import IconChevronDown from "~icons/mdi/chevron-down";
import IconDelete from "~icons/mdi/delete";
import IconSourceBranch from "~icons/mdi/source-branch";
import { ColorPaletteDropdown } from "../ui/ColorPaletteDropdown";
import { useDebounce } from "../../utils/useDebounce";

export type ManageTagRowProps = {
  tag: Tag;
  onRename: (tagId: string, name: string) => Promise<boolean>;
  onConvertToVariant?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
  onAddVariant?: (tagId: string, variant: string) => void;
  onDeleteVariant?: (tagId: string, variant: string) => void;
  onChangeColor?: (tagid: string, color: string) => void;
  isDeleting?: boolean;
  isUpdatingVariant?: boolean;
  isAddingVariant?: boolean;
  deletingVariant?: string;
};

export const ManageTagRow = ({
  tag,
  onRename,
  onConvertToVariant,
  onDelete,
  onAddVariant,
  onDeleteVariant,
  onChangeColor,
  isDeleting,
  isUpdatingVariant,
  isAddingVariant,
  deletingVariant,
}: ManageTagRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftName, setDraftName] = useState(tag.name);
  const [draftColor, setDraftColor] = useState(tag.color);
  const [newVariantName, setNewVariantName] = useState("");
  const trimmedVariantName = useMemo(
    () => newVariantName.trim(),
    [newVariantName],
  );

  const handleCommitName = async () => {
    const nextName = draftName.trim();
    if (!nextName) {
      setDraftName(tag.name);
      return;
    }
    if (nextName === tag.name) {
      return;
    }

    const ok = await onRename(tag.id, nextName);
    if (!ok) {
      setDraftName(tag.name);
    }
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleCommitName();
    }
  };

  const handleVariantEnterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && trimmedVariantName) {
      onAddVariant?.(tag.id, trimmedVariantName);
      setNewVariantName("");
    }
  };

  const debouncedSave = useDebounce((color: string) => {
    onChangeColor?.(tag.id, color);
  }, 250);
  const handleChangeColor = (color: string) => {
    setDraftColor(color);
    debouncedSave(color);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg">
        {onChangeColor ? (
          <ColorPaletteDropdown
            storyId={tag.storyId}
            value={draftColor}
            onChange={handleChangeColor}
          />
        ) : (
          <div
            className="h-7 w-7 rounded-full border border-black"
            style={{ backgroundColor: tag.color }}
          ></div>
        )}
        <TextInput
          sizing="sm"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={() => void handleCommitName()}
          onKeyDown={handleNameKeyDown}
          className="flex-1"
        />
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
                onClick={() => onConvertToVariant?.(tag)}
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
                  <span>{variant}</span>
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
