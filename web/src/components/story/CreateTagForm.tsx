import { Button, TextInput } from "flowbite-react";
import { useState, type KeyboardEvent } from "react";
import { alert } from "../../utils/alert";
import type { Tag } from "../../api/types";

export type CreateTagFormProps = {
  title?: string;
  onCreateTag: (name: string, color: string) => Promise<Tag>;
  isCreating?: boolean;
  initialColor?: string;
  namePlaceholder?: string;
};

export const CreateTagForm = ({
  title = "Add Tag",
  onCreateTag,
  isCreating,
  initialColor = "#64748b",
  namePlaceholder = "New tag name",
}: CreateTagFormProps) => {
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(initialColor);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = tagName.trim();
    if (!trimmed) {
      setError("Tag name is required.");
      return;
    }

    setError("");
    try {
      await Promise.resolve(onCreateTag(trimmed, tagColor));
      setTagName("");
    } catch (submitError) {
      if (submitError instanceof Error) {
        alert.error(submitError.message);
      } else {
        alert.error("Unable to create tag.");
      }
    }
  };

  const onTypeEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      <div className="mt-2 flex items-center">
        <input
          type="color"
          value={tagColor}
          onChange={(event) => setTagColor(event.target.value)}
          className="h-10 w-12 rounded-lg border border-slate-200 bg-white"
          aria-label="Tag color"
        />
        <TextInput
          value={tagName}
          onChange={(event) => {
            setTagName(event.target.value);
            if (error) {
              setError("");
            }
          }}
          onKeyDown={onTypeEnter}
          placeholder={namePlaceholder}
          className="flex-1"
          disabled={isCreating}
        />
        <Button type="button" onClick={handleSubmit} disabled={isCreating}>
          Add
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};
