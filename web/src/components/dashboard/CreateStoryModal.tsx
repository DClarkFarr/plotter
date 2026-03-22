import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";

interface CreateStoryModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export function CreateStoryModal({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onCreate,
}: CreateStoryModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
    }
  }, [isOpen]);

  const trimmedTitle = useMemo(() => title.trim(), [title]);
  const isValid = trimmedTitle.length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }

    onCreate(trimmedTitle);
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Create a story
            </h2>
            <p className="text-sm text-slate-500">
              Add a title to get started. You can edit the details later.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="story-title" value="Story title" />
            <TextInput
              id="story-title"
              placeholder="My new story"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          {errorMessage ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="dark"
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
