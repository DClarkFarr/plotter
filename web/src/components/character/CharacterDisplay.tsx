import { Tooltip } from "flowbite-react";
import type { Character } from "../../api/types";
import { CharacterAvatar } from "../story/CharacterAvatar";
import { CharacterCardPopover } from "./CharacterCardPopover";
import type { CharacterCardPopoverProps } from "./character-card.types";

type CharacterDisplayProps = {
  character: Character;
  showColorDot?: boolean;
  avatarSize?: "sm" | "md";
  hideAvatar?: boolean;
  avatarOnly?: boolean;
  popoverProps?: Omit<CharacterCardPopoverProps, "character" | "trigger">;
};
export const CharacterDisplay = ({
  character,
  showColorDot,
  avatarSize = "md",
  hideAvatar = false,
  avatarOnly = false,
  popoverProps,
}: CharacterDisplayProps) => {
  const contentInner = avatarOnly ? (
    <Tooltip content={character.title} placement="top">
      <CharacterAvatar
        name={character.title}
        imageUrl={character.imageUrl}
        showColorDot={showColorDot}
        size={avatarSize}
      />
    </Tooltip>
  ) : (
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
  );

  if (!popoverProps) {
    return contentInner;
  }

  const content = (
    <div className="cursor-pointer bg-black/10 rounded px-1">
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
