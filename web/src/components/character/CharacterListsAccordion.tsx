import { useState } from "react";
import type { CharacterListDraft } from "../../types/characterEditor";

import IconClose from "~icons/mdi/close";
import IconPlus from "~icons/mdi/plus";

type CharacterListsAccordionProps = {
  lists: CharacterListDraft[];
  onChange: (lists: CharacterListDraft[]) => void;
};

export const CharacterListsAccordion = ({
  lists,
  onChange,
}: CharacterListsAccordionProps) => {
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const handleAddList = () => {
    const next: CharacterListDraft = {
      id: `list-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: "",
      items: [],
      isDefault: false,
    };
    onChange([...lists, next]);
  };

  const handleListLabelChange = (index: number, value: string) => {
    onChange(
      lists.map((list, idx) =>
        idx === index ? { ...list, label: value } : list,
      ),
    );
  };

  const handleRemoveList = (index: number) => {
    onChange(lists.filter((_, idx) => idx !== index));
  };

  const handleAddItem = (index: number) => {
    const list = lists[index];
    const draft = newItems[list.id]?.trim() ?? "";
    if (!draft) {
      return;
    }

    onChange(
      lists.map((entry, idx) =>
        idx === index ? { ...entry, items: [...entry.items, draft] } : entry,
      ),
    );

    setNewItems((prev) => ({ ...prev, [list.id]: "" }));
  };

  const handleRemoveItem = (listIndex: number, itemIndex: number) => {
    onChange(
      lists.map((entry, idx) =>
        idx === listIndex
          ? {
              ...entry,
              items: entry.items.filter((_, itemIdx) => itemIdx !== itemIndex),
            }
          : entry,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {lists.map((list, index) => (
        <details
          key={list.id}
          className="rounded-lg border border-slate-200 bg-white"
        >
          <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700">
            <span className="capitalize">{list.label || "Untitled list"}</span>
            {!list.isDefault ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  handleRemoveList(index);
                }}
                className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:text-slate-700"
              >
                <IconClose className="h-4 w-4" />
              </button>
            ) : null}
          </summary>
          <div className="border-t border-slate-200 p-3 space-y-3">
            {!list.isDefault ? (
              <input
                value={list.label}
                onChange={(event) =>
                  handleListLabelChange(index, event.target.value)
                }
                placeholder="List label"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            ) : null}
            <div className="space-y-2">
              {list.items.length === 0 ? (
                <div className="text-xs text-slate-400">No items yet.</div>
              ) : (
                list.items.map((item, itemIndex) => (
                  <div
                    key={`${list.id}-item-${itemIndex}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={item}
                      onChange={(event) =>
                        onChange(
                          lists.map((entry, idx) =>
                            idx === index
                              ? {
                                  ...entry,
                                  items: entry.items.map(
                                    (entryItem, idxItem) =>
                                      idxItem === itemIndex
                                        ? event.target.value
                                        : entryItem,
                                  ),
                                }
                              : entry,
                          ),
                        )
                      }
                      className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index, itemIndex)}
                      className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:text-slate-700"
                    >
                      <IconClose className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newItems[list.id] ?? ""}
                onChange={(event) =>
                  setNewItems((prev) => ({
                    ...prev,
                    [list.id]: event.target.value,
                  }))
                }
                placeholder="Add item"
                className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddItem(index);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddItem(index)}
                className="rounded-md border border-slate-200 px-2 py-2 text-slate-500 hover:text-slate-700"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </details>
      ))}
      <button
        type="button"
        onClick={handleAddList}
        className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700"
      >
        Add List
      </button>
    </div>
  );
};
