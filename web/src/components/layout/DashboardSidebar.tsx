import IconExpandLeft from "~icons/mdi/arrow-expand-left";
import IconCollapseRight from "~icons/mdi/arrow-collapse-right";
import { useSidebarStore } from "../../store/sidebarStore";
import { useCallback } from "react";

export type DashboardSidebarProps = React.PropsWithChildren<{
  isOpen: boolean;
}>;

export const DashboardSidebar = ({
  children,
  isOpen,
}: DashboardSidebarProps) => {
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
      className={`dashboard-sidebar fixed z-100 top-0 h-screen transition transition-[right] min-w-[300px] max-w-[80vw] shadow ease-out w-[var(--sidebar-width)] ${isOpen ? "right-0" : `right-[var(--sidebar-right-open)]`}`}
      style={{
        "--sidebar-width": `${width}px`,
        "--sidebar-right-open": `-${width}px`,
      }}
    >
      <div className="right-arrow absolute top-[100px] z-200 left-[-40px]">
        <button
          className="p-2 bg-slate-500 text-white border border-slate-600 flex items-center justify-center h-10"
          onClick={onClickToggle}
        >
          {isOpen ? <IconCollapseRight /> : <IconExpandLeft />}
        </button>
      </div>
      <div className="relative scroll-y overflow-y-auto w-full h-full bg-gradient-to-b from-slate-50 via-white to-emerald-50 p-6">
        <div className="resize-right h-full absolute top-0 bottom-0 left-0 w-[4px] cursor-col-resize z-200 bg-sky-100 hover:bg-sky-300 hover:w-[6px] transition transition-colors"></div>
        {children}
      </div>
    </div>
  );
};
