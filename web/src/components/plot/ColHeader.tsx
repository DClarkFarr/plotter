import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { CustomTooltip } from "../helpers/CustomTooltip";
import type { Scene, Section } from "../../api/types";
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
  scenes: Scene[];
  sections: Section[];
};

const rowHasScene = (scenes: Scene[], rowIndex: number) =>
  scenes.some((scene) => scene.verticalIndex === rowIndex);

const rowHasSection = (sections: Section[], rowIndex: number) =>
  sections.some((section) => section.verticalIndex === rowIndex);

export const ColHeader = ({
  storyId,
  rowIndex,
  scenes,
  sections,
}: ColHeaderProps) => {
  const gridShiftMutation = useStoryGridShiftMutation(storyId);
  const createSectionMutation = useCreateSectionMutation(storyId);

  const [showSectionButtons, setShowSectionButtons] = useState(false);

  const isRowEmpty = useMemo(
    () => !rowHasScene(scenes, rowIndex) && !rowHasSection(sections, rowIndex),
    [scenes, sections, rowIndex],
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
      className="col-header group relative flex items-center justify-center bg-gray-300 min-h-[80px] focus-within:z-10"
      data-row={rowIndex}
    >
      <div className="absolute button-group left-2 top-[50%] translate-y-[-50%] invisible opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 z-200">
        {showSectionButtons && (
          <>
            <CustomTooltip content="Add Act">
              <Button
                color="gray"
                size="xs"
                type="button"
                disabled={isCreatingSection}
                onClick={handleAddAct}
              >
                Act
              </Button>
            </CustomTooltip>
            <CustomTooltip content="Add Chapter">
              <Button
                color="gray"
                size="xs"
                type="button"
                disabled={isCreatingSection}
                onClick={handleAddChapter}
              >
                Chapter
              </Button>
            </CustomTooltip>
            <CustomTooltip
              content="Back to main actions"
              className="whitespace-nowrap"
            >
              <Button
                color="red"
                size="xs"
                type="button"
                onClick={() => setShowSectionButtons(false)}
              >
                <IconClose />
              </Button>
            </CustomTooltip>
          </>
        )}
        {!showSectionButtons && (
          <>
            <CustomTooltip
              content="Insert Act/Chapter"
              className="whitespace-nowrap"
            >
              <Button
                color="gray"
                size="xs"
                type="button"
                onClick={() => setShowSectionButtons(true)}
              >
                <IconPlus />
              </Button>
            </CustomTooltip>
            <CustomTooltip
              content="insert row above"
              className="whitespace-nowrap"
            >
              <Button
                color="gray"
                size="xs"
                type="button"
                onClick={handleInsertAbove}
              >
                <IconArrowExpandUp />
              </Button>
            </CustomTooltip>
            <CustomTooltip
              content="create row below"
              className="whitespace-nowrap"
            >
              <Button
                color="gray"
                size="xs"
                type="button"
                onClick={handleInsertBelow}
              >
                <IconArrowExpandDown />
              </Button>
            </CustomTooltip>
            {isRowEmpty ? (
              <CustomTooltip
                content="clear empty row"
                className="whitespace-nowrap"
              >
                <Button
                  color="red"
                  size="xs"
                  type="button"
                  onClick={handleClearEmptyRow}
                >
                  <IconDelete />
                </Button>
              </CustomTooltip>
            ) : null}
          </>
        )}
      </div>

      <h4 className="text-xl uppercase text-gray-500 tracking-[0.2em]">
        Row {rowIndex + 1}
      </h4>
    </div>
  );
};
