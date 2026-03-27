import { create } from "zustand";

export type SidebarStore = {
  isOpen: boolean;
  width: number;
  setWidth: (width: number) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
};
export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  width: Math.max(window.innerWidth * 0.5, 450),
  setWidth: (width) => set({ width }),
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),
}));
