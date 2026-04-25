import { DragDropManager } from "@dnd-kit/dom";
import { Modifier, type DragOperation } from "@dnd-kit/abstract";
import type { Coordinates } from "@dnd-kit/utilities";

type SensitivityOptions = {
  xModifier: number;
  yModifier: number;
};
export class CustomSensitivityModifier extends Modifier {
  constructor(manager: DragDropManager, options?: SensitivityOptions) {
    super(manager, options);
  }

  public apply(operation: DragOperation): Coordinates {
    if (this.disabled) return operation.transform;

    const { xModifier = 1, yModifier = 1 } = this.options ?? {};
    const { transform } = operation;

    return {
      ...transform,
      x: transform.x * xModifier,
      y: transform.y * yModifier,
    };
  }
}
