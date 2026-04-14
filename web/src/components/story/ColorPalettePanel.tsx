import { useCallback, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useParams } from "@tanstack/react-router";
import {
  useStoryColors,
  useUpdateStoryColor,
} from "../../hooks/useStoryColors";
import type { StoryColor } from "../../types/color";

import IconDragHorizontal from "~icons/mdi/drag-horizontal";

const HEX_6_RE = /^#[0-9a-fA-F]{6}$/;
const HEX_3_RE = /^#[0-9a-fA-F]{3}$/;

const normalizeHex = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (HEX_6_RE.test(trimmed)) return trimmed.toLowerCase();
  if (HEX_3_RE.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  // allow without leading #
  const withHash = `#${trimmed}`;
  if (HEX_6_RE.test(withHash)) return withHash.toLowerCase();
  if (HEX_3_RE.test(withHash)) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
};

type ColorRowProps = {
  item: StoryColor;
  onColorChange: (colorId: string, color: string) => void;
  onIgnoredChange: (colorId: string, ignored: boolean) => void;
};

const ColorRow = ({ item, onColorChange, onIgnoredChange }: ColorRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [hexInput, setHexInput] = useState(item.color);
  const [hexError, setHexError] = useState("");

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
    setHexError("");
    onColorChange(item.id, e.target.value);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
    setHexError("");
    const normalized = normalizeHex(e.target.value);
    if (normalized) {
      onColorChange(item.id, normalized);
    } else {
      setHexError("Invalid hex color");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab text-slate-400 hover:text-slate-600"
        {...attributes}
        {...listeners}
      >
        <IconDragHorizontal className="h-4 w-4" />
      </button>

      {/* Color circle / picker */}
      <label className="relative flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center">
        <span
          className="block h-7 w-7 rounded-full border-2 border-slate-200"
          style={{ backgroundColor: item.color }}
        />
        <input
          type="color"
          value={item.color}
          onChange={handlePickerChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`Pick color for slot ${item.sortOrder}`}
        />
      </label>

      {/* Hex text input */}
      <div className="flex flex-1 flex-col">
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInput}
          maxLength={7}
          placeholder="#rrggbb"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm focus:border-blue-400 focus:outline-none"
          aria-label={`Hex value for slot ${item.sortOrder}`}
        />
        {hexError ? (
          <span className="mt-0.5 text-xs text-rose-600">{hexError}</span>
        ) : null}
      </div>

      {/* Ignore checkbox */}
      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={item.ignored}
          onChange={(e) => onIgnoredChange(item.id, e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        Ignore
      </label>
    </div>
  );
};

export function ColorPalettePanel() {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const { data: colors = [], isPending } = useStoryColors(storyId);
  const updateMutation = useUpdateStoryColor(storyId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleColorChange = useCallback(
    (colorId: string, color: string) => {
      updateMutation.mutate({ colorId, patch: { color } });
    },
    [updateMutation],
  );

  const handleIgnoredChange = useCallback(
    (colorId: string, ignored: boolean) => {
      updateMutation.mutate({ colorId, patch: { ignored } });
    },
    [updateMutation],
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      const draggedColor = colors.find((c) => c.id === active.id);
      const targetColor = colors.find((c) => c.id === over.id);
      if (!draggedColor || !targetColor) return;

      // Swap sort orders
      updateMutation.mutate({
        colorId: draggedColor.id,
        patch: { sortOrder: targetColor.sortOrder },
      });
      updateMutation.mutate({
        colorId: targetColor.id,
        patch: { sortOrder: draggedColor.sortOrder },
      });
    },
    [colors, updateMutation],
  );

  if (isPending) {
    return <div className="p-4 text-sm text-slate-400">Loading palette…</div>;
  }

  const sorted = [...colors].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Color Palette
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {sorted.map((color) => (
              <ColorRow
                key={color.id}
                item={color}
                onColorChange={handleColorChange}
                onIgnoredChange={handleIgnoredChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
