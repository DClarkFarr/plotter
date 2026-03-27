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
import type { SceneTodoItem } from "../../api/types";

export type SceneTodoListProps = {
  items: SceneTodoItem[];
  onToggle: (index: number) => void;
  onReorder: (items: SceneTodoItem[]) => void;
};

type TodoRowProps = {
  id: string;
  item: SceneTodoItem;
  index: number;
  onToggle: (index: number) => void;
};

const TodoRow = ({ id, item, index, onToggle }: TodoRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
    >
      <button
        type="button"
        aria-label="Drag todo"
        className="cursor-grab text-slate-400"
        {...attributes}
        {...listeners}
      >
        ••
      </button>
      <input
        type="checkbox"
        checked={item.isDone}
        onChange={() => onToggle(index)}
        className="h-4 w-4 rounded border-slate-300"
      />
      <span
        className={`text-sm ${
          item.isDone ? "text-slate-400 line-through" : "text-slate-700"
        }`}
      >
        {item.text}
      </span>
    </div>
  );
};

export const SceneTodoList = ({
  items,
  onToggle,
  onReorder,
}: SceneTodoListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const ids = items.map((_, index) => `todo-${index}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) {
          return;
        }

        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) {
          return;
        }

        onReorder(arrayMove(items, oldIndex, newIndex));
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <TodoRow
              key={ids[index]}
              id={ids[index]}
              item={item}
              index={index}
              onToggle={onToggle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
