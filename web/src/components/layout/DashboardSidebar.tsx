import IconExpandLeft from "~icons/mdi/arrow-expand-left";
import IconCollapseRight from "~icons/mdi/arrow-collapse-right";
import { useSidebarStore, type SidebarView } from "../../store/sidebarStore";
import { useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "flowbite-react";

import IconCloseThick from "~icons/mdi/close-thick";

export type DashboardSidebarProps = React.PropsWithChildren<{
  isOpen: boolean;
  showOpenButton?: boolean;
}>;

export const DashboardSidebar = ({
  children,
  isOpen,
  showOpenButton,
}: DashboardSidebarProps) => {
  return (
    <DashboardSidebarBody showOpenButton={showOpenButton} isOpen={isOpen}>
      {children}
    </DashboardSidebarBody>
  );
};

export const DashboardSidebarBody = ({
  children,
  isOpen,
  showOpenButton,
}: DashboardSidebarProps) => {
  const setWidth = useSidebarStore((state) => state.setWidth);
  const initialWidthRef = useRef(useSidebarStore.getState().width);
  const initialPointerXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);

  const {
    width,
    views,
    openSidebar,
    closeSidebar,
    getCurrentView,
    clearAllViews,
  } = useSidebarStore(
    useShallow((state) => ({
      width: state.width,
      views: state.views,
      openSidebar: state.openSidebar,
      closeSidebar: state.closeSidebar,
      getCurrentView: state.getCurrentView,
      clearAllViews: state.clearAllViews,
    })),
  );

  const currentView = getCurrentView(views);

  const onClickToggle = useCallback(() => {
    if (isOpen) {
      closeSidebar();
      clearAllViews();
    } else {
      openSidebar();
    }
  }, [isOpen, openSidebar, closeSidebar, clearAllViews]);

  const onResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      initialWidthRef.current = useSidebarStore.getState().width;
      initialPointerXRef.current = event.clientX;
      activePointerIdRef.current = event.pointerId;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const onResizePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - initialPointerXRef.current;
      const toSet = Math.max(
        Math.min(initialWidthRef.current - deltaX, window.innerWidth * 0.8),
        450,
      );

      setWidth(toSet);
    },
    [setWidth],
  );

  const onResizePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      activePointerIdRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  return (
    <div
      id="dashboard-sidebar"
      className={`dashboard-sidebar transition-[right] ease-out fixed z-400 top-0 h-screen min-w-[300px] max-w-[80vw] shadow w-[var(--sidebar-width)] ${isOpen ? "right-0" : `right-[var(--sidebar-right-open)]`}`}
      style={{
        "--sidebar-width": `${width}px`,
        "--sidebar-right-open": `-${width}px`,
      }}
    >
      {(isOpen || showOpenButton) && (
        <div className="right-arrow absolute top-[61px] z-200 left-[-40px]">
          <button
            className="p-2 bg-slate-500 text-white border border-slate-600 flex items-center justify-center h-10"
            onClick={onClickToggle}
          >
            {isOpen ? <IconCollapseRight /> : <IconExpandLeft />}
          </button>
        </div>
      )}
      <div
        className="resize-right h-full absolute top-0 bottom-0 left-0 w-[4px] cursor-col-resize z-200 bg-sky-100 hover:bg-sky-300 transition-colors"
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerEnd}
        onPointerCancel={onResizePointerEnd}
      ></div>

      <div className="relative scroll-y overflow-y-auto w-full h-full bg-gradient-to-b from-slate-50 via-white to-emerald-50 p-6">
        {views.length > 1 && (
          <div className="sidebar-top sticky -top-6 left-0 z-100 bg-gray-200 flex flex-wrap gap-4 py-2 px-6 -mt-6 -mx-6 mb-4">
            {views
              .slice()
              .reverse()
              .map((view) => {
                return (
                  <SidebarToggleButton
                    key={view}
                    view={view}
                    currentView={currentView}
                  />
                );
              })}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

type SidebarToggleButtonProps = {
  view: SidebarView;
  currentView: SidebarView | null;
};
export const SidebarToggleButton = ({
  view,
  currentView,
}: SidebarToggleButtonProps) => {
  const labels: Record<SidebarView, string> = {
    scene: "Selected Scene",
    character: "Manage Characters",
    tag: "Manage Tags",
    section: "Manage Sections",
    palette: "Color Palette",
    plot: "Selected Plot",
  };

  const addSidebarView = useSidebarStore((state) => state.addSidebarView);
  const removeSidebarView = useSidebarStore((state) => state.removeSidebarView);

  return (
    <div className="button-group">
      <Button
        size="sm"
        color="dark"
        outline={currentView !== view}
        onClick={() => addSidebarView(view)}
      >
        {labels[view]}
      </Button>
      {currentView === view && (
        <Button size="sm" color="dark" onClick={() => removeSidebarView(view)}>
          <IconCloseThick />
        </Button>
      )}
    </div>
  );
};
