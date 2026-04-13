import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Textarea,
  TextInput,
} from "flowbite-react";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import {
  useDeleteStoryMutation,
  useUpdateStoryMutation,
} from "../../queries/story/story-mutations";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();
  const updateMutation = useUpdateStoryMutation(storyId);
  const deleteStoryMutation = useDeleteStoryMutation(storyId);

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

    updateMutation.mutate({
      title: trimmedTitle,
      description: trimmedDescription,
    });
    setIsEditing(false);
  };

  const handleConfirmDelete = async () => {
    setDeleteError(null);
    try {
      await deleteStoryMutation.mutateAsync();
      await navigate({ to: "/dashboard" });
    } catch {
      setDeleteError("Failed to delete story. Please try again.");
    }
  };

  if (isEditing) {
    return (
      <>
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
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-rose-500">
                Danger Zone
              </div>
              <div>
                <Button
                  type="button"
                  color="red"
                  size="lg"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={
                    deleteStoryMutation.isPending || updateMutation.isPending
                  }
                >
                  Delete Story
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Modal
          dismissible
          show={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          size="md"
          className="z-999"
        >
          <ModalHeader>Are you sure you want to delete?</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                This will permanently delete the story and remove it from your
                dashboard. You cannot undo this action.
              </p>
              {deleteError ? (
                <p className="text-sm text-rose-600">{deleteError}</p>
              ) : null}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  color="gray"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteStoryMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  color="red"
                  onClick={handleConfirmDelete}
                  disabled={deleteStoryMutation.isPending}
                >
                  Yes, delete story
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </>
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
