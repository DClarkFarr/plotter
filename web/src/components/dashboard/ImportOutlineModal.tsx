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
  ImportOutlineNormalizationItem,
  ImportOutlineParsePlot,
  ImportOutlineType,
  ImportOutlineResponse,
} from "../../api/types";
import { useImportOutlineMutation } from "../../queries/story/story-mutations";
import { ImportOutlinePreviewTabs } from "./ImportOutlinePreviewTabs";
import { DEFAULT_PALETTE_COLORS } from "../../types/color";

export type ImportOutlineModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onImportComplete?: (storyId: string) => void;
};

const DEFAULT_MAIN_PLOT: ImportCustomizations["plots"][number] = {
  id: "main_plot_id",
  name: "Main",
  color: "#729cfd",
  isDefaultPlot: true,
  ignored: false,
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
  const [importType, setImportType] = useState<ImportOutlineType>("modern");
  const [customizations, setCustomizations] = useState<ImportCustomizations>(
    () => ({
      ignoredCharacterIds: [],
      characterMerges: {},
      plots: [{ ...DEFAULT_MAIN_PLOT }],
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
    setImportType("legacy");
    setCustomizations({
      ignoredCharacterIds: [],
      characterMerges: {},
      plots: [{ ...DEFAULT_MAIN_PLOT }],
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
        importType,
        file: selectedFile,
      });
      const parserPlots = (result.plots ?? []).map(
        (plot: ImportOutlineParsePlot, index) => ({
          id: plot.id,
          name: plot.name,
          color:
            plot.color ??
            DEFAULT_PALETTE_COLORS[index % DEFAULT_PALETTE_COLORS.length] ??
            "#729cfd",
          isDefaultPlot: false,
          ignored: false,
        }),
      );
      setStoryName(result.storyName);
      setPreviewData(result);
      setCustomizations({
        ignoredCharacterIds: [],
        characterMerges: {},
        plots: [{ ...DEFAULT_MAIN_PLOT }, ...parserPlots],
      });
      setCreatedStoryId(result.storyId ?? null);
      setStep("preview");
    },
    [importMutation, importType, selectedFile],
  );

  const handleApprove = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    setLocalError(null);
    const trimmedName = storyName.trim();
    const result = await importMutation.mutateAsync({
      mode: "create",
      importType,
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
    importType,
    customizations,
    onImportComplete,
  ]);

  return (
    <Modal show={isOpen} onClose={handleClose} size="6xl" popup>
      <ModalHeader className="p-6">Import outline</ModalHeader>
      <ModalBody className="flex flex-col gap-6">
        {step === "form" ? (
          <>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="import-outline-type">Import type</Label>
                <select
                  id="import-outline-type"
                  className="block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700"
                  value={importType}
                  onChange={(event) =>
                    setImportType(event.target.value as ImportOutlineType)
                  }
                  disabled={importMutation.isPending}
                >
                  <option value="modern">Modern outline</option>
                  <option value="legacy">Legacy outline</option>
                </select>
              </div>
              <p className="text-sm text-slate-600">
                Upload a .docx outline to preview what will be created.
              </p>
            </div>

            {importType === "legacy" ? (
              <LegacyImportInstructions />
            ) : (
              <ModernImportInstructions />
            )}
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
            {previewData?.normalization ? (
              <NormalizationSummary report={previewData.normalization} />
            ) : null}
            <ImportOutlinePreviewTabs
              characters={previewData?.characters ?? []}
              elements={previewData?.elements ?? []}
              tags={previewData?.tags ?? []}
              plots={previewData?.plots ?? []}
              customizations={customizations}
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
            {previewData?.normalization ? (
              <NormalizationSummary report={previewData.normalization} />
            ) : null}

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

type NormalizationSummaryProps = {
  report: NonNullable<ImportOutlineResponse["normalization"]>;
};

const NormalizationSummary = ({ report }: NormalizationSummaryProps) => {
  const renderList = (
    title: string,
    entries: ImportOutlineNormalizationItem[],
  ) => (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        {title}
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-600">No consolidation detected.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={`${title}-${entry.canonicalName}`}
              className="rounded-md border border-slate-200 bg-white p-2 text-sm"
            >
              <div className="font-medium text-slate-800">
                {entry.canonicalName}
              </div>
              <div className="text-xs text-slate-500">
                Variants ({entry.consolidatedCount}):{" "}
                {entry.rawVariants.join(", ")}
              </div>
              {entry.reusedExisting ? (
                <div className="text-xs text-emerald-700">
                  Reused existing name
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <details className="group rounded-lg border border-indigo-200 bg-indigo-50">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-indigo-900 [&::-webkit-details-marker]:hidden">
        <span>Normalization summary</span>
        <svg
          className="size-4 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="space-y-3 px-3 pb-3">
        <div className="grid gap-2 text-xs text-indigo-900 sm:grid-cols-2">
          <div>
            Tag variants consolidated: {report.counts.tagVariantsConsolidated}
          </div>
          <div>
            Character variants consolidated:{" "}
            {report.counts.characterVariantsConsolidated}
          </div>
          <div>New names created: {report.counts.newNamesCreated}</div>
          <div>Existing names reused: {report.counts.existingNamesReused}</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {renderList("Tags", report.tags)}
          {renderList("Characters", report.characters)}
        </div>
      </div>
    </details>
  );
};

const ModernImportInstructions = () => {
  return (
    <div className="text-sm text-slate-600">
      <h1 className="text-xl text-slate-950">
        Outline Layout: Acts, Chapters and Scenes
      </h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              The modern format uses heading levels to define your story
              structure. A plot heading must appear directly before each scene.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>H1 headings become acts.</li>
              <li>H2 headings become chapters.</li>
              <li>
                A plot heading (H4 or a line starting with{" "}
                <code className="bg-pink-100 text-pink-700 px-0.5">|</code>)
                comes before each scene.
              </li>
              <li>H3 headings become scenes.</li>
            </ul>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Layout Example:</p>
            <p className="text-xl font-semibold mb-4">
              (H1) Act 1 — Into the Storm
            </p>
            <p className="text-lg font-semibold mb-4">
              (H2) Chapter 1 — Arrival
            </p>
            <p className="mb-1">| Main (plot thread name)</p>
            <p className="text-md font-semibold">
              (H3) Nick Fury: Scene opens at the facility
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Scene Character POV</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Each scene can have an optional POV character assigned. Place the
              character name at the start of the H3 scene heading, followed by a
              colon.
            </p>
            <div>
              <p>
                <span>POV syntax: </span>
              </p>
              <p className="flex gap-1">
                <code className="bg-pink-100 text-pink-700 px-0.5">
                  Character Name
                </code>
                <code className="bg-pink-100 text-pink-700 px-0.5">:</code>
                <code className="bg-pink-100 text-pink-700 px-0.5">
                  Scene title
                </code>
              </p>
            </div>
            <p>Without a POV, just use a bare scene title as the H3 heading.</p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">POV Example:</p>
            <p>
              <span className="font-semibold text-white">Nick Fury:</span>
              <span> Investigates the Tesseract activity</span>
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">No POV Example:</p>
            <p>The Tesseract activates on its own</p>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Plots</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Plots group scenes into storylines and become rows in the story
              grid. Each scene belongs to exactly one plot.
            </p>
            <p>
              A plot heading must appear directly before its scene heading. Two
              forms are accepted:
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">
              Form 1 — Pipe prefix paragraph
            </p>
            <p className="flex gap-1">
              <code className="bg-pink-100 text-pink-700 px-0.5">|</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">
                Plot Name
              </code>
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">
              Form 2 — Heading 4
            </p>
            <p>Format the line as an H4 heading (the | prefix is optional).</p>
            <p className="mt-2 text-slate-500 text-xs">
              Tip: the text color of the{" "}
              <code className="bg-pink-100 text-pink-700 px-0.5">|</code>{" "}
              character in your document is captured as the plot&apos;s color on
              import.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Plots Example:</p>
            <p className="mb-1">| (H4) Main Journey</p>
            <p className="font-semibold mb-4">
              (H3) Nick Fury: Investigates the Tesseract activity
            </p>
            <p className="mb-1">| (H4) Villain Arc</p>
            <p className="font-semibold">
              (H3) Loki: Portals through the Tesseract
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Scene Tags</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Add tags to scenes to make them searchable and filterable by
              theme, subplot, or any custom category.
            </p>
            <p>
              Place the tag row as the{" "}
              <span className="font-semibold">
                first paragraph after the scene heading
              </span>
              .
            </p>
            <p>
              There are 2 kinds of tags:{" "}
              <span className="font-semibold">Basic Tags</span> and{" "}
              <span className="font-semibold">Variant Tags</span>
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">
              Basic Tags
            </p>
            <p className="flex gap-1">
              <span>Syntax: </span>
              <code className="bg-pink-100 text-pink-700 px-0.5">[</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">Tag Name</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">]</code>
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">
              Variant Tags
            </p>
            <p>A tag with an optional sub-category.</p>
            <p className="flex gap-1">
              <span>Syntax: </span>
              <code className="bg-pink-100 text-pink-700 px-0.5">[</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">Tag Name</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">:</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">
                Sub Category
              </code>
              <code className="bg-pink-100 text-pink-700 px-0.5">]</code>
            </p>
            <p className="mt-2 text-slate-500 text-xs">
              Tip: the text or highlight color of a{" "}
              <code className="bg-pink-100 text-pink-700 px-0.5">[Tag]</code>{" "}
              token in your document is preserved as the tag&apos;s color on
              import.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Basic Tag Example:</p>
            <p className="font-semibold mb-1">
              (H3) Nick Fury: Investigates the Tesseract activity
            </p>
            <span className="font-semibold text-white">[Action]</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Variant Tag Example:</p>
            <p className="font-semibold mb-1">
              (H3) Loki: Fights guards and steals the Tesseract
            </p>
            <span className="font-semibold text-white">[Action:Victory]</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Multiple Tags Example:</p>
            <p className="font-semibold mb-1">
              (H3) Gamora: Learns the truth about Thanos
            </p>
            <span className="font-semibold text-white">[Suspense]</span>{" "}
            <span className="font-semibold text-white">[Plot Twist]</span>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Snippets</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Paragraphs inside a scene can become attached snippets — useful
              for draft dialog, notes, or any extra content you don&apos;t want
              mixed into the scene description.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">
              Snippet Syntax
            </p>
            <p>
              Indent any paragraph at least{" "}
              <span className="font-semibold">0.5in</span> inside your scene and
              it becomes snippet content.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">
              Labelling a Snippet
            </p>
            <p>
              To give a snippet a label, add a heading line immediately before
              the indented block using either:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                A <span className="font-semibold">Heading 5</span>, or
              </li>
              <li>
                An indented paragraph whose text ends with{" "}
                <code className="bg-pink-100 text-pink-700 px-0.5">:</code>{" "}
                (e.g. <span className="font-semibold">Draft:</span>)
              </li>
            </ul>
            <p>
              Indented paragraphs without a preceding label are grouped into an
              auto-named snippet.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
              <p className="font-thin mb-1 uppercase">
                Scene With Snippet Example:
              </p>
              <p className="font-semibold mb-1">
                (H3) Nick Fury: Investigates the Tesseract activity
              </p>
              <p className="mb-2">[Action]</p>
              <p className="mb-4">
                Nick Fury discusses Tesseract activity with Clint and Dr.
                Selvig.
              </p>
              <p className="ml-8 mb-1 font-semibold">
                (H5) Dialog Draft (Snippet label):
              </p>
              <p className="ml-8 mb-1">
                Fury: You say peace, but I kind of think you mean the other
                thing.
              </p>
              <p className="ml-8 mb-1">Loki: Do I make you desperate?</p>
              <p className="ml-8 mb-4">
                Fury: You&apos;re making me very desperate.
              </p>
              <p>Back to scene description.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegacyImportInstructions = () => {
  return (
    <div className="text-sm text-slate-600">
      <h1 className="text-xl text-slate-950">
        Outline Layout: Acts, Scenes and Chapters
      </h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              The core of your outline is scenes. To help organize them, you can
              use headings to define acts and chapters.
            </p>

            <ul className="list-disc space-y-1 pl-5">
              <li>H2 headings become Acts.</li>
              <li>H3 headings become chapter breaks.</li>
              <li>H4 headings become scenes.</li>
            </ul>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Layout Example:</p>
            <p className="text-xl font-semibold">
              (H2) Act 1 - Building the team
            </p>
            <p className="mb-6">Paragraph content is act's description</p>

            <p className="text-lg font-semibold">
              (H3) Chapter 1 - Loki portals through the teseract
            </p>
            <p className="mb-6">Paragraph content is chapter's description</p>

            <p className="text-md font-semibold">
              (H4) Nick Fury: Scene 1 - Investigates the Tesseract activity
            </p>
            <p>Paragraph content is scene's description</p>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Scene Character POV</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Each scene can have a POV character assigned. Later you can filter
              and search scenes by POV character.
            </p>
            <p>The POV character should be at the start of a scene title.</p>
            <div>
              <p>
                <span>Use the following syntax: </span>
              </p>
              <p className="flex gap-1">
                <code className="bg-pink-100 text-pink-700 px-0.5">
                  Character Name
                </code>
                <code className="bg-pink-100 text-pink-700 px-0.5">:</code>
                <code className="bg-pink-100 text-pink-700 px-0.5">
                  The Scene title or description
                </code>
              </p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">POV Example:</p>
            <span className="font-semibold text-white">Tony Stark:</span>
            <span> Faces off with Thor</span>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Scene Tags</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Add tags to scenes to make them easily search or filter by custom
              subplots, features, or themes. It's up to you!
            </p>
            <p>
              There are 2 kinds of tags:{" "}
              <span className="font-semibold">Basic Tags</span> and{" "}
              <span className="font-semibold">Variant Tags</span>
            </p>

            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-6">
              Basic Tags
            </p>
            <p>
              Variant tags are for grouping scenes together, so they can all be
              searched as one, or by sub-category.
            </p>

            <p className="flex gap-1">
              <span>Use the following syntax: </span>
              <code className="bg-pink-100 text-pink-700 px-0.5">[</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">Tag Name</code>
              <code className="bg-pink-100 text-pink-700 px-0.5">]</code>
            </p>

            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-6">
              Variant Tags
            </p>
            <p>
              Variant tags are basically a tag with optional sub-categories.
            </p>
            <div>
              <p>
                <span>
                  For <span className="font-semibold"> Variant Tags </span>, use
                  the following syntax:{" "}
                </span>
              </p>
              <p className="flex gap-1">
                <code className="bg-pink-100 text-pink-700 px-0.5">[</code>
                <code className="bg-pink-100 text-pink-700 px-0.5">
                  Tag Name
                </code>

                <code className="bg-pink-100 text-pink-700 px-0.5">:</code>
                <code className="bg-pink-100 text-pink-700 px-0.5">
                  Sub Category Name
                </code>
                <code className="bg-pink-100 text-pink-700 px-0.5">]</code>
              </p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">
              Basic Tag Example (We want to tag all our action scenes):
            </p>
            <span>Tony Stark: </span>
            <span className="font-semibold text-white">[Action]</span>
            <span> Faces off with Thor</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Multiple Tags Example:</p>
            <span>Gamora: </span>
            <span className="font-semibold text-white">[Suspense]</span>{" "}
            <span className="font-semibold text-white">[Plot Twist]</span>
            <span> Learns the truth about Thanos</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">
              Variant Tag Example (For action scenes that end differently):
            </p>
            <p>
              <span>Loki: </span>
              <span className="font-semibold text-white">
                [Action: Victory]
              </span>
              <span> Fights guards and steals tesseract</span>
            </p>
            <p>
              <span>Loki: </span>
              <span className="font-semibold text-white">[Action: Defeat]</span>
              <span> Gets smashed by hulk</span>
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Plots</h1>
      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              If tags are for categorization, plots are for grouping scenes into
              storylines. You can use them to create rows in the story grid, and
              visually separate different subplots.
            </p>

            <p>
              Plots are different than tags. While a scene can have multiple
              tags, a scene
              <span className="font-semibold"> belongs </span> to a single plot.
            </p>
            <p>
              Each plot is a row of scenes. Together, the plots and scenes make
              up story grids
            </p>

            <p>
              Plots use the same syntax as tags. But during the upload step,
              you'll have a chance to pick which tags should actually be plots.
            </p>
            <p>
              Any scene with that plot tag, will be added to that plot's row in
              the story grid.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
            <p className="font-thin mb-1 uppercase">Plot Tags Example:</p>
            <p>
              <span>Natasha: </span>
              <span className="font-semibold text-white">[main]</span>{" "}
              <span>Recruits Bruce Banner</span>
            </p>
            <p>
              <span>Loki: </span>
              <span className="font-semibold text-white">[villain]</span>{" "}
              <span>Plots where to get uranium</span>
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-slate-950">Snippets</h1>

      <div className="lg:flex gap-6 mb-10 space-y-4">
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <p>
              Any paragraphs following a Scene (HR) heading will become that
              scene's description. But sometimes we might want to add extra
              thoughts or even small written snippets of dialog.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-6">
              The problem
            </p>
            <p>
              We might want to be able to add extra thoughts, without bloating
              the short scene description.
            </p>
            <p className="text-semibold">That's what snippets are for!</p>

            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-6">
              Snippet Syntax
            </p>
            <p>
              To mark sections of text as snippets, indent the entire section at
              least 0.5 inch.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="space-y-2">
            <div className="bg-slate-800 p-4 rounded-lg text-slate-200 mb-2">
              <p className="font-thin mb-1 uppercase">
                Scene With Snippet Example:
              </p>

              <p className="text-md font-semibold mb-2">
                (H4) Nick Fury: Scene 1 - Investigates the Tesseract activity
              </p>
              <p className="mb-2">
                Paragraph content is scene's description. Nick Fury discusses
                recent Tesseract activity with Clint and Dr. Selvig. Loki
                arrives, theatens them, and then attacks.
              </p>

              <p className="ml-12 mb-2">
                Start Snippet: This indented paragraph becomes a snippet
                attached to the scene.
              </p>
              <p className="ml-12 mb-2">
                Fury: You say pease, but I kind of think you mean the other
                thing.
              </p>
              <p className="ml-12 mb-2">Loki: Do I make you deserpate?</p>
              <p className="ml-12 mb-2">
                Fury: You're making me very deserate. You might not be glad that
                you did.
              </p>
              <p className="mb-2">End Snippet. Back to more description.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
