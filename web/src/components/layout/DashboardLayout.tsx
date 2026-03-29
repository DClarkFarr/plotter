import { Outlet } from "@tanstack/react-router";
import { DashboardTopbar } from "./DashboardTopbar";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { DashboardSidebar } from "./DashboardSidebar";
import { useSidebarStore } from "../../store/sidebarStore";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { SceneForm } from "../story/SceneForm";
import { SceneFormLoading } from "../story/SceneFormLoading";

export function DashboardLayout() {
  useAuthRedirect();
  const sidebar = useSidebarStore();

  const { isOpen, getCurrentView, views } = sidebar;

  const currentView = getCurrentView(views);

  const selectedSceneId = useSceneEditorStore((state) => state.selectedSceneId);

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
      <DashboardSidebar isOpen={isOpen} showOpenButton={false}>
        {currentView === "scene" && (
          <>
            {selectedSceneId ? (
              <SceneForm key={selectedSceneId} />
            ) : (
              <SceneFormLoading />
            )}
          </>
        )}
        {currentView === "character" && (
          <div>TODO: Character sidebar content</div>
        )}

        {currentView === "tag" && <div>TODO: Tag sidebar content</div>}
      </DashboardSidebar>
    </div>
  );
}
