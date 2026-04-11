import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";

import { useSectionEditorStore } from "../../store/sectionEditorStore";
import { useSidebarStore } from "../../store/sidebarStore";
import { useDebounce } from "../../utils/useDebounce";
import { RichTextEditor } from "../forms/RichTextEditor";
import { useStorySectionsQuery } from "../../queries/section/section-queries";
import {
  useDeleteSectionMutation,
  useUpdateSectionMutation,
} from "../../queries/section/section-mutations";
import { alert } from "../../utils/alert";

export const SectionForm = () => {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const { data: sections = [] } = useStorySectionsQuery(storyId);

  const updateSectionMutation = useUpdateSectionMutation(storyId);
  const deleteSectionMutation = useDeleteSectionMutation(storyId);

  const selectedSectionId = useSectionEditorStore(
    (state) => state.selectedSectionId,
  );
  const clearSelection = useSectionEditorStore((state) => state.clearSelection);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedSection = useMemo(() => {
    if (!selectedSectionId) return null;
    return sections.find((s) => s.id === selectedSectionId) ?? null;
  }, [sections, selectedSectionId]);

  const [draftTitle, setDraftTitle] = useState(selectedSection?.title ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    selectedSection?.description ?? "",
  );

  const debouncedTitleUpdate = useDebounce((value: string) => {
    if (!selectedSection) return;
    const trimmed = value.trim();
    if (!trimmed || trimmed === selectedSection.title) return;
    updateSectionMutation.mutate({
      sectionId: selectedSection.id,
      title: trimmed,
    });
  }, 300);

  const debouncedDescriptionUpdate = useDebounce((value: string) => {
    if (!selectedSection) return;
    if (value === (selectedSection.description ?? "")) return;
    updateSectionMutation.mutate({
      sectionId: selectedSection.id,
      description: value,
    });
  }, 300);

  const handleTitleChange = (value: string) => {
    setDraftTitle(value);
    debouncedTitleUpdate(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescriptionHtml(value);
    debouncedDescriptionUpdate(value);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSection) return;
    try {
      await deleteSectionMutation.mutateAsync(selectedSection.id);
      setIsDeleteModalOpen(false);
      clearSelection();
      closeSidebar();
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    }
  };

  if (!selectedSection) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Select a section to start editing.
      </div>
    );
  }

  const typeLabel = selectedSection.type === "act" ? "Act" : "Chapter";
  const rowLabel = `${typeLabel} — Row ${selectedSection.verticalIndex + 1}`;

  return (
    <div className="p-2 flex flex-col gap-4 min-h-full">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
          {rowLabel}
        </p>
        <input
          value={draftTitle}
          onChange={(event) => handleTitleChange(event.target.value)}
          className="w-full text-xl font-semibold text-slate-900 rounded-md px-2 -mx-2 py-1 transition-colors bg-slate-100 focus:bg-slate-200 hover:bg-slate-200 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Description
        </p>
        <RichTextEditor
          value={descriptionHtml}
          onChange={handleDescriptionChange}
          isSimpleMode
        />
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 mt-8 mt-auto">
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
            >
              Delete section
            </Button>
          </div>
        </div>
      </div>

      <Modal
        dismissible
        show={isDeleteModalOpen}
        size="md"
        onClose={() => setIsDeleteModalOpen(false)}
        className="z-999"
      >
        <ModalHeader>Are you sure you want to delete?</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <p className="mb-5 text-lg font-normal text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{selectedSection.title}"</span>?
              This cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleConfirmDelete}
            disabled={deleteSectionMutation.isPending}
          >
            {deleteSectionMutation.isPending ? "Deleting..." : "Yes, delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
