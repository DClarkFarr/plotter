import { CustomTooltip } from "../helpers/CustomTooltip";
import type { Character } from "../../api/types";
import { CharacterAvatar } from "../story/CharacterAvatar";
import { CharacterCardPopover } from "./CharacterCardPopover";
import type { CharacterCardPopoverProps } from "./character-card.types";
import { CHARACTERISTIC_LABELS } from "../../utils/characterCharacteristics";

type CharacterDisplayProps = {
  character: Character;
  showColorDot?: boolean;
  avatarSize?: "sm" | "md";
  hideAvatar?: boolean;
  avatarOnly?: boolean;
  withCharacteristicsSummary?: boolean;
  popoverProps?: Omit<CharacterCardPopoverProps, "character" | "trigger">;
};
export const CharacterDisplay = ({
  character,
  showColorDot,
  avatarSize = "md",
  hideAvatar = false,
  avatarOnly = false,
  popoverProps,
  withCharacteristicsSummary = false,
}: CharacterDisplayProps) => {
  const contentInner = avatarOnly ? (
    <CustomTooltip content={character.title} placement="top">
      <CharacterAvatar
        name={character.title}
        imageUrl={character.imageUrl}
        showColorDot={showColorDot}
        size={avatarSize}
      />
    </CustomTooltip>
  ) : (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1 items-center">
        {!hideAvatar && (
          <CharacterAvatar
            name={character.title}
            imageUrl={character.imageUrl}
            showColorDot={showColorDot}
            size={avatarSize}
          />
        )}
        <span className="font-semibold">{character.title}</span>
      </div>
      {withCharacteristicsSummary && character.characteristics ? (
        <div className="text-xs text-slate-500">
          {["age", "height", "weight"]
            .map((key) => {
              const value =
                character.characteristics?.[
                  key as keyof typeof CHARACTERISTIC_LABELS
                ];
              if (value === undefined || value === null || value === "") {
                return null;
              }
              return `${CHARACTERISTIC_LABELS[key as keyof typeof CHARACTERISTIC_LABELS]}: ${value}`;
            })
            .filter((entry): entry is string => Boolean(entry))
            .join(" • ")}
        </div>
      ) : null}
    </div>
  );

  if (!popoverProps) {
    return contentInner;
  }

  const content = (
    <div
      className={`cursor-pointer ${!avatarOnly && `hover:bg-black/10 rounded px-1`}`}
    >
      {contentInner}
    </div>
  );

  return (
    <CharacterCardPopover
      character={character}
      trigger={content}
      {...popoverProps}
    />
  );
};
