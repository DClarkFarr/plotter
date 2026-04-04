import type { ReactNode } from "react";
import type { Character } from "../../api/types";

export type CharacterCardProps = {
  character: Character;
  widthPx?: number;
  descriptionFallback?: string;
  imageFallbackLabel?: string;
  onImageClick?: () => void;
  onEditImage?: () => void;
  showEdit?: boolean;
  className?: string;
};

export type CharacterCardPopoverProps = {
  character: Character;
  trigger: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onImageClick?: () => void;
  onEditImage?: () => void;
  onEditCharacter?: () => void;
  showEdit?: boolean;
  showEditCharacter?: boolean;
  enableImageUpload?: boolean;
  cardProps?: Omit<CharacterCardProps, "character">;
  className?: string;
  popoverClassName?: string;
};
