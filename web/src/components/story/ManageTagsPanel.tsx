import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { CustomTooltip } from "../helpers/CustomTooltip";
import { useParams } from "@tanstack/react-router";
import { useStoryTagsQuery } from "../../queries/story/story-queries";
import {
  useAddTagVariantMutation,
  useCreateTagMutation,
  useDeleteTagMutation,
  useDeleteTagVariantMutation,
  useUpdateTagMutation,
} from "../../queries/tag/tag-mutation";
import type { Tag } from "../../api/types";
import { alert } from "../../utils/alert";
import { CreateTagForm } from "./CreateTagForm";
import { ManageTagRow } from "./ManageTagRow";
import { ImportTagsModal } from "./ImportTagsModal";

import IconImport from "~icons/mdi/import";

export function ManageTagsPanel() {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const tagsQuery = useStoryTagsQuery(storyId);
  const tags = tagsQuery.data ?? [];
  const createTagMutation = useCreateTagMutation(storyId);
  const { mutateAsync: updateTag } = useUpdateTagMutation(storyId);
  const { mutateAsync: deleteTag } = useDeleteTagMutation();
  const { mutateAsync: addVariant } = useAddTagVariantMutation(storyId);
  const { mutateAsync: deleteVariant } = useDeleteTagVariantMutation(storyId);
  const [query, setQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState("");
  const [isUpdatingVariant, setIsUpdatingVariant] = useState("");
  const [isAddingVariant, setIsAddingVariant] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState<{
    tagId: string;
    variant: string;
  } | null>(null);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  );

  const filteredTags = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return sortedTags;
    }

    return sortedTags.filter((tag) => {
      if (tag.name.toLowerCase().includes(normalized)) {
        return true;
      }

      return tag.variants.some((variant) =>
        variant.toLowerCase().includes(normalized),
      );
    });
  }, [query, sortedTags]);

  const handleRename = async (tagId: string, nextName: string) => {
    try {
      await updateTag({ tagId, name: nextName });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
      return false;
    }
  };

  const handleColorChange = async (tagId: string, nextValue: string) => {
    try {
      await updateTag({ tagId, color: nextValue });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
      return false;
    }
  };

  const handleCreateTag = (name: string, color: string) =>
    createTagMutation.mutateAsync({ name, color });

  const handleDelete = async (tag: Tag) => {
    if (isDeleting === tag.id) {
      return;
    }
    setIsDeleting(tag.id);
    try {
      await deleteTag({ storyId: tag.storyId, tagId: tag.id });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    } finally {
      setIsDeleting("");
    }
  };

  const handleConvertToVariant = async (tag: Tag) => {
    if (isUpdatingVariant === tag.id) {
      return;
    }
    setIsUpdatingVariant(tag.id);
    try {
      await updateTag({ tagId: tag.id, variant: true });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    } finally {
      setIsUpdatingVariant("");
    }
  };

  const handleAddVariant = async (tagId: string, name: string) => {
    setIsAddingVariant(tagId);
    try {
      await addVariant({ tagId, name });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    } finally {
      setIsAddingVariant("");
    }
  };

  const handleDeleteVariant = async (tagId: string, variant: string) => {
    setDeletingVariant({ tagId, variant });
    try {
      await deleteVariant({ tagId, variantName: variant });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    } finally {
      setDeletingVariant(null);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Manage Tags
          </p>
          <p className="text-sm text-slate-600">
            Rename tags and keep your story organized.
          </p>
        </div>
        <CustomTooltip
          content="import tags from another story"
          className="whitespace-nowrap"
        >
          <Button
            type="button"
            color="gray"
            onClick={() => setIsImportOpen(true)}
          >
            <IconImport className="" /> Tags
          </Button>
        </CustomTooltip>
      </div>

      <div className="mb-4">
        <CreateTagForm
          storyId={storyId}
          onCreateTag={handleCreateTag}
          isCreating={createTagMutation.isPending}
        />
      </div>
      <div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tags"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      {filteredTags.length === 0 ? (
        <div className="text-sm text-slate-500">No tags found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTags.map((tag) => (
            <ManageTagRow
              key={tag.id}
              tag={tag}
              onRename={handleRename}
              onConvertToVariant={handleConvertToVariant}
              onDelete={handleDelete}
              onAddVariant={handleAddVariant}
              onDeleteVariant={handleDeleteVariant}
              onChangeColor={handleColorChange}
              isDeleting={isDeleting === tag.id}
              isUpdatingVariant={isUpdatingVariant === tag.id}
              isAddingVariant={isAddingVariant === tag.id}
              deletingVariant={
                deletingVariant?.tagId === tag.id
                  ? deletingVariant.variant
                  : undefined
              }
            />
          ))}
        </div>
      )}
      <ImportTagsModal
        isOpen={isImportOpen}
        currentStoryId={storyId}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
