import { createFileRoute } from "@tanstack/react-router";
import { StoryPage } from "../../pages/story";

export const Route = createFileRoute("/dashboard/story/$storyId")({
  component: StoryPage,
});
