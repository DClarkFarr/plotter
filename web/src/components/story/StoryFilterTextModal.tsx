import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { useState } from "react";

export type StoryFilterTextModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

export const StoryFilterTextModal = ({
  isOpen,
  onClose,
  onSubmit,
}: StoryFilterTextModalProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setValue("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter text to filter.");
      return;
    }

    onSubmit(trimmed);
    setValue("");
    setError(null);
  };

  return (
    <Modal
      dismissible
      show={isOpen}
      onClose={handleClose}
      size="lg"
      className="z-200"
    >
      <ModalHeader>Custom text filter</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Enter a phrase to filter scenes on this story page.
          </p>
          <div className="flex flex-col gap-2">
            <TextInput
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder="Search text"
            />
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button color="gray" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button color="dark" type="button" onClick={handleSubmit}>
              Apply filter
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
