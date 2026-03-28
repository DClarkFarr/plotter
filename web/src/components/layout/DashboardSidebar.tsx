import IconExpandLeft from "~icons/mdi/arrow-expand-left";
import IconCollapseRight from "~icons/mdi/arrow-collapse-right";
import { useSidebarStore } from "../../store/sidebarStore";
import { useCallback, useRef } from "react";
import { useDraggable, DragDropProvider } from "@dnd-kit/react";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";

export type DashboardSidebarProps = React.PropsWithChildren<{
  isOpen: boolean;
  showOpenButton?: boolean;
}>;

export const DashboardSidebar = ({
  children,
  isOpen,
  showOpenButton,
}: DashboardSidebarProps) => {
  const sidebar = useSidebarStore();
  const initialWidthRef = useRef(sidebar.width);
  return (
    <DragDropProvider
      onDragStart={() => {
        initialWidthRef.current = sidebar.width;
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
        console.log(
          "setting",
          toSet,
          "from current",
          initialWidthRef.current,
          "-",
          b.operation.transform.x,
        );
        sidebar.setWidth(toSet);
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
  const handleRef = useRef<HTMLButtonElement>(null);

  const { ref } = useDraggable({
    id: "dashboard-sidebar",
    modifiers: [RestrictToHorizontalAxis],
  });

  const sidebar = useSidebarStore();

  const onClickToggle = useCallback(() => {
    if (isOpen) {
      sidebar.closeSidebar();
    } else {
      sidebar.openSidebar();
    }
  }, [isOpen, sidebar]);

  const width = sidebar.width;

  return (
    <div
      ref={ref}
      id="dashboard-sidebar"
      className={`dashboard-sidebar fixed z-100 top-0 h-screen transition transition-[right] min-w-[300px] max-w-[80vw] shadow ease-out w-[var(--sidebar-width)] ${isOpen ? "right-0" : `right-[var(--sidebar-right-open)]`}`}
      style={{
        "--sidebar-width": `${width}px`,
        "--sidebar-right-open": `-${width}px`,
      }}
    >
      {(isOpen || showOpenButton) && (
        <div className="right-arrow absolute top-[100px] z-200 left-[-40px]">
          <button
            ref={handleRef}
            className="p-2 bg-slate-500 text-white border border-slate-600 flex items-center justify-center h-10"
            onClick={onClickToggle}
          >
            {isOpen ? <IconCollapseRight /> : <IconExpandLeft />}
          </button>
        </div>
      )}
      <div className="relative scroll-y overflow-y-auto w-full h-full bg-gradient-to-b from-slate-50 via-white to-emerald-50 p-6">
        <div className="resize-right h-full absolute top-0 bottom-0 left-0 w-[4px] cursor-col-resize z-200 bg-sky-100 hover:bg-sky-300 hover:w-[6px] transition transition-colors"></div>
        {children}
      </div>
    </div>
  );
};
