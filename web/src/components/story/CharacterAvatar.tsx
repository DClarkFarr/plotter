import { deriveAvatarInitials } from "../layout/avatarInitials";
import { deriveAvatarColor } from "../../utils/avatarColor";

interface CharacterAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
  showColorDot?: boolean;
}

export const CharacterAvatar = ({
  name,
  imageUrl,
  size,
  showColorDot,
}: CharacterAvatarProps) => {
  const initials = deriveAvatarInitials(name);
  const fallbackColor = deriveAvatarColor(name);

  const sizeMap = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
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
        style={imageUrl ? undefined : { backgroundColor: fallbackColor }}
      ></div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-semibold text-white ${size ? sizeMap[size] : sizeMap.md} ${size ? textMap[size] : textMap.md}`}
      style={imageUrl ? undefined : { backgroundColor: fallbackColor }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{!showColorDot && initials}</span>
      )}
    </div>
  );
};
