import {
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
  Button,
} from "flowbite-react";
import type { Tag } from "../../api/types";
import { useMemo, useState, type KeyboardEvent } from "react";

import {
  useAddTagVariantMutation,
  useDeleteTagMutation,
  useDeleteTagVariantMutation,
  useUpdateTagMutation,
} from "../../queries/tag/tag-mutation";
import { alert } from "../../utils/alert";
import { SceneTagRow } from "./SceneTagRow";

export type SceneTagsModalProps = {
  isOpen: boolean;
  tags: Tag[];
  selectedTags: SceneTagSelection[];
  onClose: () => void;
  onToggleTag: (tagId: string) => void;
  onSelectVariant: (tagId: string, variant: string) => void;
  onCreateTag: (name: string, color: string) => void;
  isCreating?: boolean;
};

export type SceneTagSelection = {
  tagId: string;
  variant?: string;
};

export const SceneTagsModal = ({
  isOpen,
  tags,
  selectedTags,
  onClose,
  onToggleTag,
  onSelectVariant,
  onCreateTag,
  isCreating,
}: SceneTagsModalProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#64748b");
  const [isDeleting, setIsDeleting] = useState("");
  const [isUpdatingVariant, setIsUpdatingVariant] = useState("");
  const [isAddingVariant, setIsAddingVariant] = useState("");
  const [deletingVariant, setDeletingVariant] = useState<{
    tagId: string;
    variant: string;
  } | null>(null);

  const handleSubmit = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      return;
    }
    onCreateTag(trimmed, newTagColor);
    setNewTagName("");
  };

  const onTypeEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const { mutateAsync } = useDeleteTagMutation();
  const storyId = tags[0]?.storyId ?? "";
  const { mutateAsync: updateTag } = useUpdateTagMutation(storyId);
  const { mutateAsync: addVariant } = useAddTagVariantMutation(storyId);
  const { mutateAsync: deleteVariant } = useDeleteTagVariantMutation(storyId);

  const onClickDelete = async (tag: Tag) => {
    if (isDeleting === tag.id) {
      return;
    }
    setIsDeleting(tag.id);

    try {
      await mutateAsync({ tagId: tag.id, storyId: tag.storyId }).then(() => {
        setIsDeleting("");
      });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    } finally {
      setIsDeleting("");
    }
  };

  const onConvertToVariant = async (tag: Tag) => {
    if (isUpdatingVariant === tag.id) {
      return;
    }
    if (!storyId) {
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

  const onAddVariant = async (tagId: string, name: string) => {
    if (!storyId) {
      return;
    }
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

  const onDeleteVariant = async (tagId: string, variant: string) => {
    if (!storyId) {
      return;
    }
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

  const selectedTagIds = useMemo(
    () => selectedTags.map((selection) => selection.tagId),
    [selectedTags],
  );
  const selectedTagVariants = useMemo(
    () =>
      new Map(selectedTags.map((selection) => [selection.tagId, selection])),
    [selectedTags],
  );

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => {
      const aSelected = selectedTagIds.includes(a.id);
      const bSelected = selectedTagIds.includes(b.id);
      if (aSelected && !bSelected) {
        return -1;
      }
      if (!aSelected && bSelected) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });
  }, [tags, selectedTagIds]);

  return (
    <Modal
      dismissible
      show={isOpen}
      onClose={onClose}
      size="lg"
      className="z-999"
    >
      <ModalHeader>Scene Tags</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Add Tag
            </p>
            <div className="mt-2 flex items-center">
              <input
                type="color"
                value={newTagColor}
                onChange={(event) => setNewTagColor(event.target.value)}
                className="h-10 w-12 rounded-lg border border-slate-200 bg-white"
                aria-label="Tag color"
              />
              <TextInput
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                onKeyDown={onTypeEnter}
                placeholder="New tag name"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              All Tags
            </p>
            {sortedTags.map((tag) => {
              const checked = selectedTagIds.includes(tag.id);
              const selectedVariant = selectedTagVariants.get(tag.id)?.variant;
              return (
                <SceneTagRow
                  key={tag.id}
                  tag={tag}
                  checked={checked}
                  onToggle={onToggleTag}
                  selectedVariant={selectedVariant}
                  onSelectVariant={onSelectVariant}
                  onConvertToVariant={onConvertToVariant}
                  onDelete={onClickDelete}
                  onAddVariant={onAddVariant}
                  onDeleteVariant={onDeleteVariant}
                  isDeleting={isDeleting === tag.id}
                  isUpdatingVariant={isUpdatingVariant === tag.id}
                  isAddingVariant={isAddingVariant === tag.id}
                  deletingVariant={
                    deletingVariant?.tagId === tag.id
                      ? deletingVariant.variant
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
