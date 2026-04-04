import { deriveAvatarInitials } from "../layout/avatarInitials";
import { deriveAvatarColor } from "../../utils/avatarColor";
import { resolveCharacterImageUrl } from "../../utils/characterImage";

interface CharacterAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
  showColorDot?: boolean;
  withBorder?: boolean;
}

export const CharacterAvatar = ({
  name,
  imageUrl,
  size,
  showColorDot,
  withBorder,
}: CharacterAvatarProps) => {
  const initials = deriveAvatarInitials(name);
  const fallbackColor = deriveAvatarColor(name);
  const resolvedImageUrl = resolveCharacterImageUrl(imageUrl);

  const sizeMap = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    dot: "h-3 w-3",
  };
  const textMap = {
    sm: "text-[9px]",
    md: "text-[10px]",
  };

  if (showColorDot) {
    return (
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-semibold text-white ${sizeMap.dot}`}
        style={{ backgroundColor: fallbackColor }}
      ></div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-semibold text-white leading-1 ${size ? sizeMap[size] : sizeMap.md} ${size ? textMap[size] : textMap.md} ${withBorder ? "border-2 border-[var(--avatar-color)]" : ""}`}
      style={{
        ...(!resolvedImageUrl ? { backgroundColor: fallbackColor } : {}),
        "--avatar-color": fallbackColor,
      }}
    >
      {resolvedImageUrl ? (
        <img
          src={resolvedImageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{!showColorDot && initials}</span>
      )}
    </div>
  );
};
