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
  plot: Plot | undefined;
};

export type SceneRenderer<T extends BaseSceneRendererProps> = (
  props: T,
) => React.ReactNode;
