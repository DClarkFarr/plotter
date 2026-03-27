import {
  Badge,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";
import type { Tag } from "../../api/types";

export type SceneTagsModalProps = {
  isOpen: boolean;
  tags: Tag[];
  selectedTagIds: string[];
  onClose: () => void;
  onToggle: (tagId: string) => void;
};

export const SceneTagsModal = ({
  isOpen,
  tags,
  selectedTagIds,
  onClose,
  onToggle,
}: SceneTagsModalProps) => {
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <ModalHeader>Scene Tags</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
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
