import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { useCallback, useMemo, useState } from "react";

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

  const trimmedTitle = useMemo(() => title.trim(), [title]);
  const isValid = trimmedTitle.length > 0;

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isValid || isSubmitting) {
        return;
      }

      onCreate(trimmedTitle);
    },
    [onCreate, isValid, isSubmitting, trimmedTitle],
  );

  const handleClose = useCallback(() => {
    onClose();
    setTitle("");
  }, [onClose]);

  return (
    <Modal show={isOpen} onClose={handleClose} size="md" popup>
      <ModalHeader className="bg-gray-900 p-6 ">Create a story</ModalHeader>
      <ModalBody className="bg-gray-900">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white"></h2>
            <p className="text-sm text-slate-500">
              Add a title to get started. You can edit the details later.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="story-title">Story title</Label>
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
      </ModalBody>
    </Modal>
  );
}
