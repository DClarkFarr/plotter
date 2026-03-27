import { Outlet } from "@tanstack/react-router";
import { DashboardTopbar } from "./DashboardTopbar";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { DashboardSidebar } from "./DashboardSidebar";
import { useSidebarStore } from "../../store/sidebarStore";
import { StoryForm } from "../story/StoryForm";
import { StoryFormLoading } from "../story/StoryFormLoading";
import { useSceneEditorStore } from "../../store/sceneEditorStore";

export function DashboardLayout() {
  useAuthRedirect();
  const sidebar = useSidebarStore();
  const selectedScene = useSceneEditorStore((state) => state.selectedScene);

  return (
    <div className="x-scroller w-screen overflow-x-hidden relative">
      <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <DashboardTopbar />
        <div
          className="flex-1 w-full h-[var(--dashboard-content-height)]"
          style={{
            "--dashboard-content-height": "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </div>
      </div>
      <DashboardSidebar isOpen={sidebar.isOpen}>
        {selectedScene ? (
          <StoryForm selectedScene={selectedScene} key={selectedScene.id} />
        ) : (
          <StoryFormLoading />
        )}
      </DashboardSidebar>
    </div>
  );
}
