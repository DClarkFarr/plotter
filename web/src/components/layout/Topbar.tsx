import { Link } from "@tanstack/react-router";
import { Navbar, NavbarBrand } from "flowbite-react";
import { useAuthStore } from "../../store/authStore";

export function Topbar() {
  const { isAuthenticated, clearUser } = useAuthStore();

  return (
    <Navbar border>
      <NavbarBrand as="span">
        <Link
          to="/"
          className="font-bold text-xl text-gray-900 dark:text-white"
        >
          plotter
        </Link>
      </NavbarBrand>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 px-3 py-2"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={clearUser}
              className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 px-3 py-2"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 px-3 py-2"
            >
              Log In
            </Link>
            <Link
              to="/sign-up"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </Navbar>
  );
}
