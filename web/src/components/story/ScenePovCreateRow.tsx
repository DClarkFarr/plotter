import { useState } from "react";

interface ScenePovCreateRowProps {
  isSaving?: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const ScenePovCreateRow = ({
  isSaving,
  onSave,
  onCancel,
}: ScenePovCreateRowProps) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Character name"
        className="flex-1 text-sm text-slate-700 rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-200"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 px-3 py-2 rounded-md disabled:opacity-60"
      >
        {isSaving ? "Saving" : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
      >
        Cancel
      </button>
    </div>
  );
};
