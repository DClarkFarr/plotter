import {
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
  Button,
} from "flowbite-react";
import type { Tag } from "../../api/types";
import { useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";

import IconDelete from "~icons/mdi/delete";
import IconChevronDown from "~icons/mdi/chevron-down";
import IconSourceBranch from "~icons/mdi/source-branch";
import { useDeleteTagMutation } from "../../queries/tag/tag-mutation";
import { alert } from "../../utils/alert";

export type SceneTagsModalProps = {
  isOpen: boolean;
  tags: Tag[];
  selectedTagIds: string[];
  onClose: () => void;
  onToggle: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => void;
  isCreating?: boolean;
};

export const SceneTagsModal = ({
  isOpen,
  tags,
  selectedTagIds,
  onClose,
  onToggle,
  onCreateTag,
  isCreating,
}: SceneTagsModalProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#64748b");
  const [isDeleting, setIsDeleting] = useState("");

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

  const onSafeClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const { mutateAsync } = useDeleteTagMutation();

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
              return (
                <label
                  key={tag.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => onToggle(tag.id)}
                  />
                  <div
                    className="color-preview w-4 h-4 border border-1 border-black rounded-full bg-[var(--tag-color)]"
                    style={{ "--tag-color": tag.color }}
                  ></div>
                  <Label className="text-sm text-slate-700">{tag.name}</Label>

                  <div
                    className="checkbox-actions ml-auto -my-2 -mr-3 p-1 bg-gray-100 rounded-l-lg text-sm button-group"
                    onClick={onSafeClick}
                  >
                    <div>
                      {tag.variant ? (
                        <Button type="button" color="gray" size="xs">
                          <span>{tag.variants.length}</span>
                          <span>
                            <IconChevronDown className="ml-1" />
                          </span>
                        </Button>
                      ) : (
                        <Button type="button" color="sky" size="xs">
                          <IconSourceBranch />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        color="red"
                        size="xs"
                        onClick={() => onClickDelete(tag)}
                        disabled={isDeleting === tag.id}
                      >
                        <IconDelete />
                      </Button>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
