import { createFileRoute } from "@tanstack/react-router";
import { RenderTest } from "../../pages/render-test";

export const Route = createFileRoute("/test/render-count")({
  component: RenderTest,
});
