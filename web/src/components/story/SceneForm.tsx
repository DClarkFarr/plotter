import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  useCreateTagMutation,
  useStoryPlotsQuery,
  useStoryTagsQuery,
  useUpdateSceneMutation,
} from "../../hooks/useStory";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { SceneTags } from "./SceneTags";
import { SceneTagsModal } from "./SceneTagsModal";
import { SceneTodoList } from "./SceneTodoList";
import { useDebounce } from "../../utils/useDebounce";
import type { SceneTodoItem } from "../../api/types";

import IconLabelMultiple from "~icons/mdi/label-multiple";
import { RichTextEditor } from "../forms/RichTextEditor";

export const SceneForm = () => {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const { data: plots = [], isLoading } = useStoryPlotsQuery(storyId);
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const updateSceneMutation = useUpdateSceneMutation(storyId);
  const createTagMutation = useCreateTagMutation(storyId);
  const selectedSceneId = useSceneEditorStore((state) => state.selectedSceneId);
  const selectedPlotId = useSceneEditorStore((state) => state.selectedPlotId);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

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

    if (selectedPlot) {
      return (
        selectedPlot.scenes.find((scene) => scene.id === selectedSceneId) ??
        null
      );
    }

    for (const plot of plots) {
      const match = plot.scenes.find((scene) => scene.id === selectedSceneId);
      if (match) {
        return match;
      }
    }

    return null;
  }, [plots, selectedPlot, selectedSceneId]);

  const [draftTitle, setDraftTitle] = useState(selectedScene?.title ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    selectedScene?.description ?? "",
  );

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
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    updateSceneMutation.mutate({ sceneId: selectedScene.id, tags: next });
  };

  const handleCreateTag = (name: string, color: string) => {
    createTagMutation.mutate({ name, color });
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
    <div className="p-2 flex flex-col gap-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
          {selectedPlot?.title} - Row {selectedScene.verticalIndex + 1}
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
          selectedTagIds={selectedScene.tags}
          onOpen={() => setIsTagModalOpen(true)}
        />
      </div>
      <SceneTagsModal
        isOpen={isTagModalOpen}
        tags={tags}
        selectedTagIds={selectedScene.tags}
        onClose={() => setIsTagModalOpen(false)}
        onToggle={handleToggleTag}
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
      {updateSceneMutation.error ? (
        <div className="text-sm text-rose-600">
          {updateSceneMutation.error instanceof Error
            ? updateSceneMutation.error.message
            : "Unable to save scene changes"}
        </div>
      ) : null}
    </div>
  );
};
