import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";

import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { useSidebarStore } from "../../store/sidebarStore";
import { SceneTags } from "./SceneTags";
import { SceneTagsModal } from "./SceneTagsModal";
import { SceneTodoList } from "./SceneTodoList";
import { ScenePovSelect } from "./ScenePovSelect";
import { useDebounce } from "../../utils/useDebounce";
import type { SceneSnippet, SceneTodoItem } from "../../api/types";

import IconLabelMultiple from "~icons/mdi/label-multiple";
import { RichTextEditor } from "../forms/RichTextEditor";
import {
  useStoryCharactersQuery,
  useStoryPlotsQuery,
  useStoryScenesQuery,
  useStoryTagsQuery,
} from "../../queries/story/story-queries";
import {
  useDeleteSceneMutation,
  useUpdateSceneMutation,
} from "../../queries/scene/scene-mutations";
import { useCreateTagMutation } from "../../queries/tag/tag-mutation";
import { useCharacterModalStore } from "../../store/characterModalStore";
import { alert } from "../../utils/alert";
import IconChevronDown from "~icons/mdi/chevron-down";

export const SceneForm = () => {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const { data: plots = [], isLoading } = useStoryPlotsQuery(storyId);
  const { data: scenes = [] } = useStoryScenesQuery(storyId);
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const { data: characters = [], isLoading: isCharactersLoading } =
    useStoryCharactersQuery(storyId);
  const updateSceneMutation = useUpdateSceneMutation(storyId);
  const deleteSceneMutation = useDeleteSceneMutation(storyId);
  const createTagMutation = useCreateTagMutation(storyId);
  const selectedSceneId = useSceneEditorStore((state) => state.selectedSceneId);
  const selectedPlotId = useSceneEditorStore((state) => state.selectedPlotId);
  const clearSelection = useSceneEditorStore((state) => state.clearSelection);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const openCreateCharacter = useCharacterModalStore(
    (state) => state.openCreate,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSnippetModalOpen, setIsAddSnippetModalOpen] = useState(false);
  const [newSnippetLabel, setNewSnippetLabel] = useState("");
  const [newSnippetText, setNewSnippetText] = useState("");
  const [expandedSnippetIndex, setExpandedSnippetIndex] = useState<
    number | null
  >(null);

  const selectedPlot = useMemo(() => {
    if (!selectedPlotId) {
      return null;
    }
    return plots.find((plot) => plot.id === selectedPlotId) ?? null;
  }, [plots, selectedPlotId]);

  const selectedScene = useMemo(() => {
    if (!selectedSceneId) {
      return null;
    }
    return scenes.find((scene) => scene.id === selectedSceneId) ?? null;
  }, [scenes, selectedSceneId]);

  const sortedCharacters = useMemo(
    () =>
      [...characters].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      ),
    [characters],
  );

  const selectedPov = useMemo(() => {
    if (!selectedScene?.pov) {
      return null;
    }

    return (
      sortedCharacters.find(
        (character) => character.id === selectedScene.pov,
      ) ?? null
    );
  }, [sortedCharacters, selectedScene]);

  const [draftTitle, setDraftTitle] = useState(selectedScene?.title ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    selectedScene?.description ?? "",
  );
  const snippets = selectedScene?.snippets ?? [];

  const debouncedTitleUpdate = useDebounce((value: string) => {
    if (!selectedScene) {
      return;
    }
    const trimmed = value.trim();
    if (!trimmed || trimmed === selectedScene.title) {
      return;
    }
    updateSceneMutation.mutate({ sceneId: selectedScene.id, title: trimmed });
  }, 300);

  const debouncedDescriptionUpdate = useDebounce((value: string) => {
    if (!selectedScene) {
      return;
    }
    if (value === selectedScene.description) {
      return;
    }
    updateSceneMutation.mutate({
      sceneId: selectedScene.id,
      description: value,
    });
  }, 300);

  const debouncedSnippetsUpdate = useDebounce((next: SceneSnippet[]) => {
    if (!selectedScene) {
      return;
    }

    updateSceneMutation.mutate({ sceneId: selectedScene.id, snippets: next });
  }, 300);

  const handleTitleChange = (value: string) => {
    setDraftTitle(value);
    debouncedTitleUpdate(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescriptionHtml(value);
    debouncedDescriptionUpdate(value);
  };

  const handleToggleTag = (tagId: string) => {
    if (!selectedScene) {
      return;
    }
    const selectedTagIds = selectedScene.tags ?? [];
    const isSelected = selectedTagIds.includes(tagId);
    const nextTags = isSelected
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    const nextVariants = (selectedScene.tagVariants ?? []).filter(
      (entry) => entry.tagId !== tagId,
    );

    updateSceneMutation.mutate({
      sceneId: selectedScene.id,
      tags: nextTags,
      tagVariants: nextVariants,
    });
  };

  const handleSelectVariant = (tagId: string, variant: string) => {
    if (!selectedScene) {
      return;
    }

    const selectedTagIds = selectedScene.tags ?? [];
    const nextTags = selectedTagIds.includes(tagId)
      ? selectedTagIds
      : [...selectedTagIds, tagId];

    const nextVariants = (selectedScene.tagVariants ?? []).filter(
      (entry) => entry.tagId !== tagId,
    );
    nextVariants.push({ tagId, variant });

    updateSceneMutation.mutate({
      sceneId: selectedScene.id,
      tags: nextTags,
      tagVariants: nextVariants,
    });
  };

  const handleCreateTag = async (name: string, color: string) => {
    return await createTagMutation.mutateAsync({ name, color });
  };

  const handlePovChange = (characterId: string | null) => {
    if (!selectedScene) {
      return;
    }

    updateSceneMutation.mutate({ sceneId: selectedScene.id, pov: characterId });
  };

  const handleToggleTodo = (index: number) => {
    if (!selectedScene) {
      return;
    }
    const next = selectedScene.todo.map((item, idx) =>
      idx === index ? { ...item, isDone: !item.isDone } : item,
    );

    updateSceneMutation.mutate({ sceneId: selectedScene.id, todo: next });
  };

  const handleReorderTodo = (next: SceneTodoItem[]) => {
    if (!selectedScene) {
      return;
    }
    updateSceneMutation.mutate({ sceneId: selectedScene.id, todo: next });
  };

  const handleAddTodo = (text: string) => {
    if (!selectedScene) {
      return;
    }
    const next = [...selectedScene.todo, { text, isDone: false }];
    updateSceneMutation.mutate({ sceneId: selectedScene.id, todo: next });
  };

  const handleToggleSnippet = (index: number) => {
    setExpandedSnippetIndex((current) => (current === index ? null : index));
  };

  const updateSnippet = (index: number, patch: Partial<SceneSnippet>) => {
    if (!selectedScene) {
      return;
    }

    const next = snippets.map((snippet, idx) =>
      idx === index ? { ...snippet, ...patch } : snippet,
    );

    debouncedSnippetsUpdate(next);
  };

  const handleConfirmDelete = async () => {
    if (!selectedScene) {
      return;
    }

    try {
      await deleteSceneMutation.mutateAsync(selectedScene.id);
      setIsDeleteModalOpen(false);
      clearSelection();
      closeSidebar();
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    }
  };

  const handleOpenAddSnippet = () => {
    setNewSnippetLabel("");
    setNewSnippetText("");
    setIsAddSnippetModalOpen(true);
  };

  const handleCreateSnippet = () => {
    if (!selectedScene) {
      return;
    }

    const label = newSnippetLabel.trim() || "Untitled snippet";
    const text = newSnippetText.trim();

    const next = [...snippets, { label, text }];
    updateSceneMutation.mutate({ sceneId: selectedScene.id, snippets: next });
    setExpandedSnippetIndex(next.length - 1);
    setIsAddSnippetModalOpen(false);
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading scene...</div>;
  }

  if (!selectedScene) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Select a scene to start editing.
      </div>
    );
  }

  return (
    <div className="p-2 flex flex-col gap-4 min-h-full">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
          {selectedPlot?.title} - Row {selectedScene.verticalIndex + 1}
        </p>

        <input
          value={draftTitle}
          onChange={(event) => handleTitleChange(event.target.value)}
          className="w-full text-xl font-semibold text-slate-900 rounded-md px-2 -mx-2 py-1 transition-colors bg-slate-100 focus:bg-slate-200 hover:bg-slate-200 focus:outline-none"
        />
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
            POV
          </p>
          <ScenePovSelect
            value={selectedPov}
            options={sortedCharacters}
            isLoading={isCharactersLoading}
            onChange={(character) =>
              handlePovChange(character ? character.id : null)
            }
            onAddCharacter={openCreateCharacter}
          />
        </div>
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
      <div className="mb-4">
        <div className="flex justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
              Tags
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsTagModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              <IconLabelMultiple className="inline-block w-4 h-4 mr-1" /> Manage
            </button>
          </div>
        </div>
        <SceneTags
          tags={tags}
          selectedTags={selectedScene.tags ?? []}
          tagVariants={selectedScene.tagVariants ?? []}
          onOpen={() => setIsTagModalOpen(true)}
        />
      </div>
      <SceneTagsModal
        isOpen={isTagModalOpen}
        tags={tags}
        selectedTags={(selectedScene.tags ?? []).map((tagId) => ({
          tagId,
          variant: selectedScene.tagVariants?.find(
            (entry) => entry.tagId === tagId,
          )?.variant,
        }))}
        onClose={() => setIsTagModalOpen(false)}
        onToggleTag={handleToggleTag}
        onSelectVariant={handleSelectVariant}
        onCreateTag={handleCreateTag}
        isCreating={createTagMutation.isPending}
      />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Todo List
        </p>
        <SceneTodoList
          items={selectedScene.todo}
          onToggle={handleToggleTodo}
          onReorder={handleReorderTodo}
          onAdd={handleAddTodo}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Snippets
          </p>
          <Button
            type="button"
            color="dark"
            size="xs"
            onClick={handleOpenAddSnippet}
          >
            Add snippet
          </Button>
        </div>
        {snippets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Capture ideas or draft text as snippets for this scene.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {snippets.map((snippet, index) => {
              const isExpanded = expandedSnippetIndex === index;
              const label = snippet.label?.trim() || "Untitled snippet";

              return (
                <div
                  key={`snippet-${index}`}
                  className="rounded-lg border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSnippet(index)}
                    className="block w-full flex items-center justify-between text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 rounded-md transition-colors px-3 py-2"
                  >
                    <span>{label}</span>
                    <span>
                      <IconChevronDown
                        className={`transition-transform ${!isExpanded ? "-rotate-90" : ""}`}
                      />
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-3 py-2 flex flex-col gap-3">
                      <input
                        value={snippet.label ?? ""}
                        onChange={(event) =>
                          updateSnippet(index, { label: event.target.value })
                        }
                        placeholder="Snippet title"
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
                      />
                      <RichTextEditor
                        key={`snippet-editor-${index}`}
                        value={snippet.text ?? ""}
                        onChange={(value) =>
                          updateSnippet(index, { text: value })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {updateSceneMutation.error ? (
        <div className="text-sm text-rose-600">
          {updateSceneMutation.error instanceof Error
            ? updateSceneMutation.error.message
            : "Unable to save scene changes"}
        </div>
      ) : null}
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
              disabled={deleteSceneMutation.isPending}
            >
              Delete Scene
            </Button>
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
              This will remove the scene from the active story grid. You can not
              undo this action right now.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                color="gray"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteSceneMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                color="red"
                onClick={handleConfirmDelete}
                disabled={deleteSceneMutation.isPending}
              >
                Yes, delete scene
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        dismissible
        show={isAddSnippetModalOpen}
        onClose={() => setIsAddSnippetModalOpen(false)}
        size="lg"
        className="z-999"
      >
        <ModalHeader>Add snippet</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Snippets are a place to capture ideas or draft text for this
              scene.
            </p>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Title
              </label>
              <input
                value={newSnippetLabel}
                onChange={(event) => setNewSnippetLabel(event.target.value)}
                placeholder="Snippet title"
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Snippet text
              </label>
              <div className="mt-2">
                <RichTextEditor
                  value={newSnippetText}
                  onChange={setNewSnippetText}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                color="gray"
                onClick={() => setIsAddSnippetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" color="dark" onClick={handleCreateSnippet}>
                Add snippet
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
