import IconExpandLeft from "~icons/mdi/arrow-expand-left";
import IconCollapseRight from "~icons/mdi/arrow-collapse-right";
import { useSidebarStore, type SidebarView } from "../../store/sidebarStore";
import { useCallback, useRef } from "react";
import { useDraggable, DragDropProvider } from "@dnd-kit/react";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { useShallow } from "zustand/react/shallow";
import { Button, ButtonGroup } from "flowbite-react";

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
  const width = useSidebarStore((state) => state.width);
  const setWidth = useSidebarStore((state) => state.setWidth);

  const initialWidthRef = useRef(width);
  return (
    <DragDropProvider
      onDragStart={() => {
        initialWidthRef.current = width;
      }}
      onDragMove={(b) => {
        // const { position } = b.operation;
        // console.log("Current position:", {
        //   current: position.current,
        //   initial: position.initial,
        //   transformX: b.operation.transform.x,
        // });

        const toSet = Math.max(
          Math.min(
            initialWidthRef.current - b.operation.transform.x,
            window.innerWidth * 0.8,
          ),
          450,
        );

        setWidth(toSet);
      }}
      onDragEnd={(c) => {
        console.log(`Dropped`, c);
      }}
    >
      <DashboardSidebarBody showOpenButton={showOpenButton} isOpen={isOpen}>
        {children}
      </DashboardSidebarBody>
    </DragDropProvider>
  );
};

export const DashboardSidebarBody = ({
  children,
  isOpen,
  showOpenButton,
}: DashboardSidebarProps) => {
  const { ref: dragRef } = useDraggable({
    id: "dashboard-sidebar",
    modifiers: [RestrictToHorizontalAxis],
  });

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

  return (
    <div
      id="dashboard-sidebar"
      className={`dashboard-sidebar transition-[right] ease-out fixed z-200 top-0 h-screen min-w-[300px] max-w-[80vw] shadow w-[var(--sidebar-width)] ${isOpen ? "right-0" : `right-[var(--sidebar-right-open)]`}`}
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
        ref={dragRef}
        className="resize-right h-full absolute top-0 bottom-0 left-0 w-[4px] cursor-col-resize z-200 bg-sky-100 hover:bg-sky-300 hover:w-[6px] transition transition-colors"
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
  };

  const addSidebarView = useSidebarStore((state) => state.addSidebarView);
  const removeSidebarView = useSidebarStore((state) => state.removeSidebarView);

  return (
    <ButtonGroup>
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
    </ButtonGroup>
  );
};
