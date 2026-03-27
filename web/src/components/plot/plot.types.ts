import type { Plot, Scene } from "../../api/types";

export type BaseSceneRendererProps = {
  sceneIndex: number;
  plotIndex: number;
};

export type SceneRendererProps = BaseSceneRendererProps & {
  scene: Scene;
  plot: Plot;
};
export type EmptyRendererProps = Omit<BaseSceneRendererProps, "plot"> & {
  storyId: string;
  plot: Plot | undefined;
  isDisabled?: boolean;
};

export type SceneRenderer<T extends BaseSceneRendererProps> = (
  props: T,
) => React.ReactNode;

export type SceneCardTypes =
  | {
      type: "empty";
    }
  | { type: "scene"; index: number };
