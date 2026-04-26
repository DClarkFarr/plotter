import { create } from "zustand";

export type SidebarView =
  | "scene"
  | "section"
  | "character"
  | "tag"
  | "palette"
  | "plot";

export type SidebarStore = {
  isOpen: boolean;
  width: number;
  views: SidebarView[];
  getCurrentView: (views: SidebarView[]) => SidebarView | null;
  addSidebarView: (view: SidebarView) => void;
  removeSidebarView: (view: SidebarView) => void;
  setWidth: (width: number) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  clearAllViews: () => void;
};
export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  width: Math.max(window.innerWidth * 0.5, 450),
  views: [],
  addSidebarView: (view) =>
    set((state) => ({
      views: [...state.views.filter((v) => v !== view), view],
    })),
  removeSidebarView: (view) =>
    set((state) => ({ views: state.views.filter((v) => v !== view) })),
  setWidth: (width) => set({ width }),
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),

  getCurrentView(views) {
    return views[views.length - 1] ?? null;
  },
  clearAllViews: () => set({ views: [] }),
}));
