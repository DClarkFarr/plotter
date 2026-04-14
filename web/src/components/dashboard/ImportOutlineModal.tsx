import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { useCallback, useMemo, useState } from "react";
import type {
  ApiError,
  ImportCustomizations,
  ImportOutlineParseTag,
  ImportOutlineResponse,
} from "../../api/types";
import { useImportOutlineMutation } from "../../queries/story/story-mutations";
import { ImportOutlinePreviewTabs } from "./ImportOutlinePreviewTabs";

export type ImportOutlineModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onImportComplete?: (storyId: string) => void;
};

const defaultPlotTag: ImportOutlineParseTag = {
  id: "main_plot_id",
  name: "Main",
  color: "#729cfd",
  variant: null,
  isDefaultPlot: true,
};
export const ImportOutlineModal = ({
  isOpen,
  isSubmitting = false,
  errorMessage,
  onClose,
  onImportComplete,
}: ImportOutlineModalProps) => {
  const importMutation = useImportOutlineMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "preview" | "complete">("form");
  const [previewData, setPreviewData] = useState<ImportOutlineResponse | null>(
    null,
  );
  const [createdStoryId, setCreatedStoryId] = useState<string | null>(null);
  const [storyName, setStoryName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<ImportCustomizations>(
    () => ({
      ignoredCharacterIds: [],
      characterMerges: {},
      plotTagIds: ["main_plot_id"],
    }),
  );

  const resolvedError = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }
    if (localError) {
      return localError;
    }
    const error = importMutation.error as ApiError | undefined;
    return error?.serverMessage ?? null;
  }, [errorMessage, localError, importMutation.error]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreviewData(null);
    setCreatedStoryId(null);
    setStoryName("");
    setStep("form");
    setLocalError(null);
    setCustomizations({
      ignoredCharacterIds: [],
      characterMerges: {},
      plotTagIds: ["main_plot_id"],
    });
    importMutation.reset();
  }, [importMutation]);

  const handleClose = useCallback(() => {
    if (isSubmitting || importMutation.isPending) {
      return;
    }
    resetState();
    onClose();
  }, [importMutation.isPending, isSubmitting, onClose, resetState]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (!file) {
        setSelectedFile(null);
        return;
      }

      const isDocxName = file.name.toLowerCase().endsWith(".docx");
      const isDocxMime =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isDocxName && !isDocxMime) {
        setSelectedFile(null);
        setLocalError("Please choose a .docx document.");
        return;
      }

      setLocalError(null);
      setSelectedFile(file);
    },
    [],
  );

  const handlePreview = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedFile) {
        setLocalError("Select a .docx file to upload.");
        return;
      }

      setLocalError(null);
      const result = await importMutation.mutateAsync({
        mode: "preview",
        file: selectedFile,
      });
      setStoryName(result.storyName);
      setPreviewData({
        ...result,
        tags: [{ ...defaultPlotTag }, ...(result?.tags ?? [])],
      });
      setCustomizations({
        ignoredCharacterIds: [],
        characterMerges: {},
        plotTagIds: ["main_plot_id"],
      });
      setCreatedStoryId(result.storyId ?? null);
      setStep("preview");
    },
    [importMutation, selectedFile],
  );

  const handleApprove = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    setLocalError(null);
    const trimmedName = storyName.trim();
    const result = await importMutation.mutateAsync({
      mode: "create",
      file: selectedFile,
      ...(trimmedName ? { storyName: trimmedName } : {}),
      customizations,
    });
    setPreviewData(result);
    setCreatedStoryId(result.storyId ?? null);
    setStep("complete");
    if (result.storyId) {
      onImportComplete?.(result.storyId);
    }
  }, [
    importMutation,
    selectedFile,
    storyName,
    customizations,
    onImportComplete,
  ]);

  const onChangeTags = (toSet: ImportOutlineParseTag[]) => {
    setPreviewData((prev) => {
      if (prev) {
        return {
          ...prev,
          tags: toSet,
        };
      }
      return prev;
    });
  };

  return (
    <Modal show={isOpen} onClose={handleClose} size="6xl" popup>
      <ModalHeader className="p-6">Import outline</ModalHeader>
      <ModalBody className="flex flex-col gap-6">
        {step === "form" ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Upload a .docx outline to preview what will be created.
              </p>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Heading map
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>H1 headings become act separators.</li>
                  <li>H2 headings become chapter breaks.</li>
                  <li>H4 headings become scenes.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Sections
                </p>
                <p>
                  Indent a paragraph block to group it into a section under the
                  nearest heading.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  POV syntax
                </p>
                <p>
                  Use <span className="font-semibold">POV: Character Name</span>
                  to mark a scene POV.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Tag syntax
                </p>
                <p>
                  Use{" "}
                  <span className="font-semibold">
                    Tags: #tag-one, #tag-two
                  </span>
                  to attach scene tags.
                </p>
              </div>
            </div>
          </>
        ) : null}
        {resolvedError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {resolvedError}
          </div>
        ) : null}
        {step === "form" ? (
          <form className="flex flex-col gap-4" onSubmit={handlePreview}>
            <div className="space-y-1">
              <Label htmlFor="import-outline-file">.docx file</Label>
              <input
                id="import-outline-file"
                type="file"
                accept=".docx"
                className="block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700"
                onChange={handleFileChange}
                disabled={importMutation.isPending}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button color="light" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                color="dark"
                type="submit"
                disabled={!selectedFile || importMutation.isPending}
              >
                {importMutation.isPending ? "Uploading..." : "Preview"}
              </Button>
            </div>
          </form>
        ) : null}
        {step === "preview" ? (
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="import-outline-story">Story name</Label>
              <TextInput
                id="import-outline-story"
                placeholder="Imported story"
                value={storyName}
                onChange={(event) => setStoryName(event.target.value)}
                disabled={importMutation.isPending}
              />
            </div>
            <ImportOutlinePreviewTabs
              characters={previewData?.characters ?? []}
              elements={previewData?.elements ?? []}
              tags={previewData?.tags ?? []}
              customizations={customizations}
              onChangeTags={onChangeTags}
              onCustomizationChange={setCustomizations}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                color="light"
                type="button"
                onClick={() => setStep("form")}
                disabled={importMutation.isPending}
              >
                Back
              </Button>
              <Button
                color="dark"
                type="button"
                onClick={handleApprove}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? "Importing..." : "Approve import"}
              </Button>
            </div>
          </div>
        ) : null}
        {step === "complete" ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Import completed. Summary: {previewData?.summary ?? ""}
              {createdStoryId ? (
                <div className="mt-2 text-xs text-emerald-700">
                  New story id: {createdStoryId}
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-end">
              <Button color="dark" type="button" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </ModalBody>
    </Modal>
  );
};
