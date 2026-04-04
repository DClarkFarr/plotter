import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import IconDragHorizontal from "~icons/mdi/drag-horizontal";
import IconClose from "~icons/mdi/close";

import type { CharacterCustomAttributeDraft } from "../../types/characterEditor";

type CharacterCustomAttributesProps = {
  items: CharacterCustomAttributeDraft[];
  onChange: (items: CharacterCustomAttributeDraft[]) => void;
};

type AttributeRowProps = {
  item: CharacterCustomAttributeDraft;
  onChange: (next: CharacterCustomAttributeDraft) => void;
  onRemove: () => void;
};

const AttributeRow = ({ item, onChange, onRemove }: AttributeRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
    >
      <button
        type="button"
        aria-label="Drag custom attribute"
        className="cursor-grab text-slate-400"
        {...attributes}
        {...listeners}
      >
        <IconDragHorizontal className="h-4 w-4" />
      </button>
      <input
        value={item.label}
        onChange={(event) => onChange({ ...item, label: event.target.value })}
        placeholder="Label"
        className="w-1/3 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm"
      />
      <input
        value={item.value}
        onChange={(event) => onChange({ ...item, value: event.target.value })}
        placeholder="Value"
        className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm"
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:text-slate-700"
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  );
};

export const CharacterCustomAttributes = ({
  items,
  onChange,
}: CharacterCustomAttributesProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleAdd = () => {
    const next: CharacterCustomAttributeDraft = {
      id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: "",
      value: "",
    };
    onChange([...items, next]);
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) {
            return;
          }

          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          if (oldIndex < 0 || newIndex < 0) {
            return;
          }

          onChange(arrayMove(items, oldIndex, newIndex));
        }}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <AttributeRow
                key={item.id}
                item={item}
                onChange={(next) =>
                  onChange(
                    items.map((entry, idx) => (idx === index ? next : entry)),
                  )
                }
                onRemove={() =>
                  onChange(items.filter((_, idx) => idx !== index))
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={handleAdd}
        className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700"
      >
        Add Custom Attribute
      </button>
    </div>
  );
};
