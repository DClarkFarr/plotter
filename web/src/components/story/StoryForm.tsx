import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  useStoryPlotsQuery,
  useStoryTagsQuery,
  useUpdateSceneMutation,
} from "../../hooks/useStory";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { SceneDescriptionEditor } from "./SceneDescriptionEditor";
import { SceneTags } from "./SceneTags";
import { SceneTagsModal } from "./SceneTagsModal";
import { SceneTodoList } from "./SceneTodoList";

export const StoryForm = () => {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const { data: plots = [], isLoading } = useStoryPlotsQuery(storyId);
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const updateSceneMutation = useUpdateSceneMutation(storyId);
  const selectedScene = useSceneEditorStore((state) => state.selectedScene);
  const tagSelections = useSceneEditorStore((state) => state.tagSelections);
  const isTagModalOpen = useSceneEditorStore((state) => state.isTagModalOpen);
  const openTagModal = useSceneEditorStore((state) => state.openTagModal);
  const closeTagModal = useSceneEditorStore((state) => state.closeTagModal);
  const setTagSelections = useSceneEditorStore(
    (state) => state.setTagSelections,
  );
  const todoDraft = useSceneEditorStore((state) => state.todoDraft);
  const setTodoDraft = useSceneEditorStore((state) => state.setTodoDraft);

  const scenePlot = useMemo(() => {
    if (!selectedScene) return null;
    return plots.find((plot) =>
      plot.scenes.some((scene) => scene.id === selectedScene.id),
    );
  }, [selectedScene, plots]);

  const [draftTitle, setDraftTitle] = useState(selectedScene?.title ?? "");

  // useEffect(() => {
  //   setDraftTitle(selectedScene?.title ?? "");
  //   setTagSelections(selectedScene?.tags ?? []);
  //   setTodoDraft(selectedScene?.todo ?? []);
  // }, [
  //   selectedScene?.id,
  //   selectedScene?.title,
  //   selectedScene?.tags,
  //   selectedScene?.todo,
  //   setTagSelections,
  //   setTodoDraft,
  // ]);

  const handleTitleBlur = () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || nextTitle === selectedScene?.title) {
      setDraftTitle(selectedScene?.title ?? "");
      return;
    }

    updateSceneMutation.mutate({
      sceneId: selectedScene?.id ?? "",
      title: nextTitle,
    });
  };

  const handleToggleTag = (tagId: string) => {
    const next = tagSelections.includes(tagId)
      ? tagSelections.filter((id) => id !== tagId)
      : [...tagSelections, tagId];

    setTagSelections(next);
    updateSceneMutation.mutate({
      sceneId: selectedScene?.id ?? "",
      tags: next,
    });
  };

  const handleToggleTodo = (index: number) => {
    const next = todoDraft.map((item, idx) =>
      idx === index ? { ...item, isDone: !item.isDone } : item,
    );
    setTodoDraft(next);
    updateSceneMutation.mutate({
      sceneId: selectedScene?.id ?? "",
      todo: next,
    });
  };

  const handleReorderTodo = (next: typeof todoDraft) => {
    setTodoDraft(next);
    updateSceneMutation.mutate({
      sceneId: selectedScene?.id ?? "",
      todo: next,
    });
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
    <div className="p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Editing Scene
        </p>
        <input
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={handleTitleBlur}
          className="w-full text-xl font-semibold text-slate-900 bg-transparent rounded-md px-2 -mx-2 py-1 transition-colors hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
        />
        <p className="text-sm text-slate-500">
          Plot: {scenePlot?.title || "Untitled Plot"}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Description
        </p>
        <SceneDescriptionEditor
          value={selectedScene?.scene ?? ""}
          onCommit={(value) =>
            updateSceneMutation.mutate({
              sceneId: selectedScene?.id ?? "",
              scene: value,
            })
          }
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Tags
        </p>
        <SceneTags
          tags={tags}
          selectedTagIds={tagSelections}
          onOpen={openTagModal}
        />
      </div>
      <SceneTagsModal
        isOpen={isTagModalOpen}
        tags={tags}
        selectedTagIds={tagSelections}
        onClose={closeTagModal}
        onToggle={handleToggleTag}
      />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Todo List
        </p>
        <SceneTodoList
          items={todoDraft}
          onToggle={handleToggleTodo}
          onReorder={handleReorderTodo}
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
