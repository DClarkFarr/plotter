import { Tooltip } from "flowbite-react";
import type { Character } from "../../api/types";
import { CharacterAvatar } from "../story/CharacterAvatar";

type CharacterDisplayProps = {
  character: Character;
  showColorDot?: boolean;
  avatarSize?: "sm" | "md";
  hideAvatar?: boolean;
  avatarOnly?: boolean;
};
export const CharacterDisplay = ({
  character,
  showColorDot,
  avatarSize = "md",
  hideAvatar = false,
  avatarOnly = false,
}: CharacterDisplayProps) => {
  if (avatarOnly) {
    return (
      <Tooltip content={character.title} placement="top">
        <CharacterAvatar
          name={character.title}
          imageUrl={character.imageUrl}
          showColorDot={showColorDot}
          size={avatarSize}
        />
      </Tooltip>
    );
  }
  return (
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
};
