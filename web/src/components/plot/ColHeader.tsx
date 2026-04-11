import { useMemo, useState } from "react";
import { Button, ButtonGroup, Tooltip } from "flowbite-react";
import type { Plot, Section } from "../../api/types";
import { useCreateSectionMutation } from "../../queries/section/section-mutations";
import { useStoryGridShiftMutation } from "../../queries/story/story-mutations";
import IconArrowExpandUp from "~icons/mdi/arrow-expand-up";
import IconArrowExpandDown from "~icons/mdi/arrow-expand-down";
import IconDelete from "~icons/mdi/delete";
import IconPlus from "~icons/mdi/plus";
import IconClose from "~icons/mdi/close";

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
  const gridShiftMutation = useStoryGridShiftMutation(storyId);
  const createSectionMutation = useCreateSectionMutation(storyId);

  const [showSectionButtons, setShowSectionButtons] = useState(false);

  const isRowEmpty = useMemo(
    () => !rowHasScene(plots, rowIndex) && !rowHasSection(sections, rowIndex),
    [plots, sections, rowIndex],
  );

  const handleInsertAbove = () => {
    gridShiftMutation.mutate({ startIndex: rowIndex, shift: 1 });
  };

  const handleInsertBelow = () => {
    gridShiftMutation.mutate({ startIndex: rowIndex + 1, shift: 1 });
  };

  const handleClearEmptyRow = () => {
    if (!isRowEmpty) {
      return;
    }

    gridShiftMutation.mutate({ startIndex: rowIndex, shift: -1 });
  };

  const handleAddAct = () => {
    createSectionMutation.mutate({
      title: `Act ${rowIndex + 1}`,
      type: "act",
      verticalIndex: rowIndex,
    });
    setShowSectionButtons(false);
  };

  const handleAddChapter = () => {
    createSectionMutation.mutate({
      title: `Chapter ${rowIndex + 1}`,
      type: "chapter",
      verticalIndex: rowIndex,
    });
    setShowSectionButtons(false);
  };

  const isCreatingSection = createSectionMutation.isPending;

  return (
    <div
      className="col-header group relative flex items-center justify-center bg-gray-200 min-h-[80px] focus-within:z-10"
      data-row={rowIndex}
    >
      <ButtonGroup className="absolute left-2 top-[50%] translate-y-[-50%] invisible opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 z-200">
        {showSectionButtons && (
          <>
            <Button
              color="gray"
              size="xs"
              type="button"
              disabled={isCreatingSection}
              onClick={handleAddAct}
            >
              Act
            </Button>
            <Button
              color="gray"
              size="xs"
              type="button"
              disabled={isCreatingSection}
              onClick={handleAddChapter}
            >
              Chapter
            </Button>
            <Button
              color="red"
              size="xs"
              type="button"
              onClick={() => setShowSectionButtons(false)}
            >
              <Tooltip
                content="Back to main actions"
                className="whitespace-nowrap"
              >
                <IconClose />
              </Tooltip>
            </Button>
          </>
        )}
        {!showSectionButtons && (
          <>
            <Button
              color="gray"
              size="xs"
              type="button"
              onClick={() => setShowSectionButtons(true)}
            >
              <Tooltip
                content="Insert Act/Chapter"
                className="whitespace-nowrap"
              >
                <IconPlus />
              </Tooltip>
            </Button>

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
            {isRowEmpty ? (
              <Button
                color="red"
                size="xs"
                type="button"
                onClick={handleClearEmptyRow}
              >
                <Tooltip
                  content="clear empty row"
                  className="whitespace-nowrap"
                >
                  <IconDelete />
                </Tooltip>
              </Button>
            ) : null}
          </>
        )}
      </ButtonGroup>

      <h4 className="text-xl uppercase text-gray-500 tracking-[0.2em]">
        Row {rowIndex + 1}
      </h4>
    </div>
  );
};
