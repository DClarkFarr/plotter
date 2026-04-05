import type { SceneTodoItem } from "../../api/types";

export type ListViewTodoListProps = {
  items: SceneTodoItem[];
};

export const ListViewTodoList = ({ items }: ListViewTodoListProps) => {
  if (items.length === 0) {
    return null;
  }

  const ordered = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.isDone !== b.item.isDone) {
        return a.item.isDone ? 1 : -1;
      }
      return a.index - b.index;
    });

  return (
    <div className="mt-4 flex flex-col gap-2">
      {ordered.map(({ item, index }) => (
        <div
          key={`todo-${index}`}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <input
            type="checkbox"
            checked={item.isDone}
            readOnly
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
      ))}
    </div>
  );
};
