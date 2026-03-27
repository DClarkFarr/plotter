import type { Story } from "../../api/types";

export type StoryFormProps = {
  story: Story;
};
export const StoryForm = ({ story }: StoryFormProps) => {
  return (
    <div>
      <h1>TODO: Render story form here</h1>
      <pre>{JSON.stringify(story, null, 2)}</pre>
    </div>
  );
};
