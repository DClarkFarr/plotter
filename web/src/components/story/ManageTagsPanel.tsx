import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { TextInput } from "flowbite-react";
import { useStoryTagsQuery } from "../../queries/story/story-queries";
import { useUpdateTagMutation } from "../../queries/tag/tag-mutation";
import type { Tag } from "../../api/types";
import { alert } from "../../utils/alert";

export function ManageTagsPanel() {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const tagsQuery = useStoryTagsQuery(storyId);
  const tags = tagsQuery.data ?? [];
  const { mutateAsync: updateTag } = useUpdateTagMutation(storyId);
  const [localNames, setLocalNames] = useState<Record<string, string>>({});

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  );

  const handleNameChange = (tag: Tag, value: string) => {
    setLocalNames((prev) => ({ ...prev, [tag.id]: value }));
  };

  const handleNameCommit = async (tag: Tag) => {
    const nextName = (localNames[tag.id] ?? tag.name).trim();
    if (!nextName || nextName === tag.name) {
      setLocalNames((prev) => ({ ...prev, [tag.id]: tag.name }));
      return;
    }

    try {
      await updateTag({ tagId: tag.id, name: nextName });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
      setLocalNames((prev) => ({ ...prev, [tag.id]: tag.name }));
    }
  };

  if (tagsQuery.isLoading) {
    return <div className="text-sm text-slate-500">Loading tags...</div>;
  }

  if (tagsQuery.error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        Unable to load tags. Please try again.
      </div>
    );
  }

  if (sortedTags.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No tags yet. Create tags from scenes to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Manage Tags
        </p>
        <p className="text-sm text-slate-600">
          Rename tags and keep your story organized.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {sortedTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div
              className="h-4 w-4 rounded-full border border-black"
              style={{ backgroundColor: tag.color }}
            ></div>
            <TextInput
              sizing="sm"
              value={localNames[tag.id] ?? tag.name}
              onChange={(event) => handleNameChange(tag, event.target.value)}
              onBlur={() => handleNameCommit(tag)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNameCommit(tag);
                }
              }}
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
