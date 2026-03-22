import { Outlet } from "@tanstack/react-router";
import { DashboardTopbar } from "./DashboardTopbar";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export function DashboardLayout() {
  useAuthRedirect();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <DashboardTopbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
