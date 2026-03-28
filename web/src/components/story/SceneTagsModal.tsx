import {
  Badge,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
  Button,
} from "flowbite-react";
import type { Tag } from "../../api/types";
import { useState } from "react";

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
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#64748b");

  const handleSubmit = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      return;
    }
    onCreateTag(trimmed, newTagColor);
    setNewTagName("");
  };

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
        <div className="flex flex-col gap-4">
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
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Selected
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTags.length === 0 ? (
                <p className="text-sm text-slate-500">No tags selected.</p>
              ) : (
                selectedTags.map((tag) => (
                  <Badge key={tag.id} color="light">
                    {tag.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              All Tags
            </p>
            {tags.map((tag) => {
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
                </label>
              );
            })}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
