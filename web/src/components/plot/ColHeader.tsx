import { useMemo } from "react";
import { Button, ButtonGroup, Tooltip } from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Plot, Section } from "../../api/types";
import { applyOptimisticShift } from "../../queries/story/shifted-resources";
import { useCreateSectionMutation } from "../../queries/section/section-mutations";
import { useStoryGridShiftMutation } from "../../queries/story/story-mutations";
import IconArrowExpandUp from "~icons/mdi/arrow-expand-up";
import IconArrowExpandDown from "~icons/mdi/arrow-expand-down";
import IconDelete from "~icons/mdi/delete";

export type ColHeaderProps = {
  storyId: string;
  rowIndex: number;
  plots: Plot[];
  sections: Section[];
};

const rowHasScene = (plots: Plot[], rowIndex: number) =>
  plots.some((plot) =>
    plot.scenes.some((scene) => scene.verticalIndex === rowIndex),
  );

const rowHasSection = (sections: Section[], rowIndex: number) =>
  sections.some((section) => section.verticalIndex === rowIndex);

export const ColHeader = ({
  storyId,
  rowIndex,
  plots,
  sections,
}: ColHeaderProps) => {
  const queryClient = useQueryClient();
  const gridShiftMutation = useStoryGridShiftMutation(storyId);
  const createSectionMutation = useCreateSectionMutation(storyId);

  const isRowEmpty = useMemo(
    () => !rowHasScene(plots, rowIndex) && !rowHasSection(sections, rowIndex),
    [plots, sections, rowIndex],
  );

  const handleInsertAbove = () => {
    applyOptimisticShift(queryClient, storyId, {
      rangeStart: rowIndex,
      rangeEnd: undefined,
      shift: 1,
    });
    gridShiftMutation.mutate({ startIndex: rowIndex, shift: 1 });
  };

  const handleInsertBelow = () => {
    applyOptimisticShift(queryClient, storyId, {
      rangeStart: rowIndex + 1,
      rangeEnd: undefined,
      shift: 1,
    });
    gridShiftMutation.mutate({ startIndex: rowIndex + 1, shift: 1 });
  };

  const handleClearEmptyRow = () => {
    if (!isRowEmpty) {
      return;
    }

    applyOptimisticShift(queryClient, storyId, {
      rangeStart: rowIndex + 1,
      rangeEnd: undefined,
      shift: -1,
    });
    gridShiftMutation.mutate({ startIndex: rowIndex, shift: -1 });
  };

  const handleAddAct = () => {
    createSectionMutation.mutate({
      title: `Act ${rowIndex + 1}`,
      type: "act",
      verticalIndex: rowIndex,
    });
  };

  const handleAddChapter = () => {
    createSectionMutation.mutate({
      title: `Chapter ${rowIndex + 1}`,
      type: "section",
      verticalIndex: rowIndex,
    });
  };

  const isCreatingSection = createSectionMutation.isPending;

  return (
    <div
      className="col-header group relative flex items-center justify-center bg-gray-200"
      data-row={rowIndex}
    >
      <div className="absolute left-1 top-1 flex flex-col gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          color="gray"
          size="xs"
          type="button"
          disabled={isCreatingSection}
          onClick={handleAddAct}
        >
          Add act
        </Button>
        <Button
          color="gray"
          size="xs"
          type="button"
          disabled={isCreatingSection}
          onClick={handleAddChapter}
        >
          Add chapter
        </Button>
      </div>

      <ButtonGroup className="absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
        <Button
          color="gray"
          size="xs"
          type="button"
          onClick={handleInsertAbove}
        >
          <Tooltip content="insert row above" className="whitespace-nowrap">
            <IconArrowExpandUp />
          </Tooltip>
        </Button>
      </ButtonGroup>

      <ButtonGroup className="absolute right-1 bottom-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
        <Button
          color="gray"
          size="xs"
          type="button"
          onClick={handleInsertBelow}
        >
          <Tooltip content="create row below" className="whitespace-nowrap">
            <IconArrowExpandDown />
          </Tooltip>
        </Button>
      </ButtonGroup>

      {isRowEmpty ? (
        <ButtonGroup className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          <Button
            color="gray"
            size="xs"
            type="button"
            onClick={handleClearEmptyRow}
          >
            <Tooltip content="clear empty row" className="whitespace-nowrap">
              <IconDelete />
            </Tooltip>
          </Button>
        </ButtonGroup>
      ) : null}

      <h4 className="text-xl uppercase text-gray-500 tracking-[0.2em]">
        Row {rowIndex + 1}
      </h4>
    </div>
  );
};
