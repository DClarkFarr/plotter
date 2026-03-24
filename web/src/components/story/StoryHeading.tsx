import { useState } from "react";
import { Button, Textarea, TextInput } from "flowbite-react";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import { useUpdateStoryMutation } from "../../hooks/useStory";

interface StoryHeadingProps {
  storyId: string;
  title: string | null | undefined;
  description: string | null | undefined;
}

export function StoryHeading({
  storyId,
  title,
  description,
}: StoryHeadingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title ?? "");
  const [draftDescription, setDraftDescription] = useState(description ?? "");
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateStoryMutation(storyId);

  const handleEdit = () => {
    setError(null);
    setDraftTitle(title ?? "");
    setDraftDescription(description ?? "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setError(null);
    setDraftTitle(title ?? "");
    setDraftDescription(description ?? "");
    setIsEditing(false);
  };

  const handleSave = () => {
    const trimmedTitle = draftTitle.trim();
    const trimmedDescription = draftDescription.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (!trimmedDescription) {
      setError("Description is required.");
      return;
    }

    updateMutation.mutate({
      title: trimmedTitle,
      description: trimmedDescription,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          <TextInput
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Story title"
            sizing="lg"
          />
          <Textarea
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            rows={4}
            placeholder="Story description"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex items-center gap-2">
            <Button
              color="gray"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          {title?.trim() || "Untitled story"}
        </h1>
        <button
          type="button"
          onClick={handleEdit}
          className="rounded-full p-1 text-slate-400 transition hover:text-slate-700 cursor-pointer"
          aria-label="Edit story heading"
        >
          <IconLeadPencil className="text-lg" />
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {description?.trim() || "No description yet."}
      </p>
    </div>
  );
}
