import { Link } from "@tanstack/react-router";
import {
  Avatar,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
} from "flowbite-react";
import { useAuthStore } from "../../store/authStore";
import { deriveAvatarInitials } from "./avatarInitials";
import { useCallback } from "react";
import { logout } from "../../api/auth";

export function DashboardTopbar() {
  const { user, clearUser } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initials = deriveAvatarInitials(fullName);

  const handleLogout = useCallback(() => {
    clearUser();
    logout();
  }, [clearUser]);

  return (
    <Navbar
      fluid
      className="border-b border-slate-200 bg-white/90 backdrop-blur z-[100] sticky top-0"
    >
      <NavbarBrand as="span">
        <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
          plotter
        </Link>
      </NavbarBrand>
      <div id="dashboard-topbar"></div>
      <div className="flex items-center gap-3">
        <Dropdown
          inline
          dismissOnClick
          label={<Avatar rounded placeholderInitials={initials} />}
        >
          <DropdownHeader>
            <div className="flex items-center gap-3">
              <Avatar rounded placeholderInitials={initials} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  {fullName || "User"}
                </span>
                <span className="text-xs text-slate-500">Account</span>
              </div>
            </div>
          </DropdownHeader>
          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
        </Dropdown>
      </div>
    </Navbar>
  );
}
