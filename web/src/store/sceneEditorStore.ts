import { create } from "zustand";
import type { Scene, SceneTodoItem } from "../api/types";
import { useSidebarStore } from "./sidebarStore";

export type SceneEditorState = {
  selectedScene: Scene | null;
  isSidebarOpen: boolean;
  isTagModalOpen: boolean;
  tagSelections: string[];
  todoDraft: SceneTodoItem[];
  isSaving: boolean;
  error: string | null;
  selectScene: (scene: Scene) => void;
  clearSelection: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  openTagModal: () => void;
  closeTagModal: () => void;
  setTagSelections: (tagIds: string[]) => void;
  setTodoDraft: (todo: SceneTodoItem[]) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
};

export const useSceneEditorStore = create<SceneEditorState>((set) => ({
  selectedScene: null,
  isSidebarOpen: false,
  isTagModalOpen: false,
  tagSelections: [],
  todoDraft: [],
  isSaving: false,
  error: null,
  selectScene: (scene) => {
    useSidebarStore.getState().openSidebar();
    set({ selectedScene: scene, isSidebarOpen: true });
  },
  clearSelection: () => {
    useSidebarStore.getState().closeSidebar();
    set({ selectedScene: null, isSidebarOpen: false, error: null });
  },
  setSidebarOpen: (isOpen) => {
    if (isOpen) {
      useSidebarStore.getState().openSidebar();
    } else {
      useSidebarStore.getState().closeSidebar();
    }
    set({ isSidebarOpen: isOpen });
  },
  openTagModal: () => set({ isTagModalOpen: true }),
  closeTagModal: () => set({ isTagModalOpen: false }),
  setTagSelections: (tagIds) => set({ tagSelections: tagIds }),
  setTodoDraft: (todo) => set({ todoDraft: todo }),
  setSaving: (isSaving) => set({ isSaving }),
  setError: (error) => set({ error }),
}));
