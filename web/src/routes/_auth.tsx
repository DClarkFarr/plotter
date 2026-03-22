import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Card } from "flowbite-react";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <Outlet />
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});
