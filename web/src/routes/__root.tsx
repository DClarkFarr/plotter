import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";

function RootLayout() {
  const { setUser, clearUser } = useAuthStore();

  const { data, isError, isSuccess } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (isError) {
      clearUser();
    }
  }, [isError, clearUser]);

  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootLayout,
});
