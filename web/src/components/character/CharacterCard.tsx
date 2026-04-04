import { useState } from "react";
import { Modal, ModalBody, ModalHeader, Tooltip } from "flowbite-react";
import { resolveCharacterImageUrl } from "../../utils/characterImage";
import { deriveAvatarColor } from "../../utils/avatarColor";
import { deriveAvatarInitials } from "../layout/avatarInitials";
import type { CharacterCardProps } from "./character-card.types";
import { CHARACTERISTIC_LABELS } from "../../utils/characterCharacteristics";

import IconAccountBoxEditOutline from "~icons/mdi/account-box-edit-outline";

export const CharacterCard = ({
  character,
  widthPx = 350,
  descriptionFallback = "No description yet.",
  imageFallbackLabel = "No image",
  onImageClick,
  onEditImage,
  showEdit = false,
  className = "",
}: CharacterCardProps) => {
  const description = character.description?.trim() || descriptionFallback;
  const summaryItems = ["age", "height", "weight", "build", "eyeColor", "hair"]
    .map((key) => {
      const value =
        character.characteristics?.[key as keyof typeof CHARACTERISTIC_LABELS];
      if (value === undefined || value === null || value === "") {
        return null;
      }
      return `${CHARACTERISTIC_LABELS[key as keyof typeof CHARACTERISTIC_LABELS]}: ${value}`;
    })
    .filter((entry): entry is string => Boolean(entry));
  const resolvedImageUrl = resolveCharacterImageUrl(character.imageUrl);
  const fallbackColor = deriveAvatarColor(character.title);
  const initials = deriveAvatarInitials(character.title);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick();
      return;
    }
    if (resolvedImageUrl) {
      setIsLightboxOpen(true);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      style={{ width: `${widthPx}px` }}
    >
      <button
        type="button"
        onClick={handleImageClick}
        className="block w-full"
        aria-label={`Open ${character.title} image`}
      >
        {resolvedImageUrl ? (
          <div className="h-56 relative w-full overflow-hidden">
            <div
              className="absolute blur-[2px] absolute -inset-1 bg-cover bg-center"
              style={{ backgroundImage: `url(${resolvedImageUrl})` }}
            ></div>
            <img
              src={resolvedImageUrl}
              alt={character.title}
              className="h-56 object-contain w-full relative"
            />
          </div>
        ) : (
          <div
            className="flex h-56 w-full flex-col items-center justify-center gap-2 text-white"
            style={{ backgroundColor: fallbackColor }}
          >
            <div className="text-2xl font-semibold uppercase tracking-[0.2em]">
              {initials}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-80">
              {imageFallbackLabel}
            </div>
          </div>
        )}
      </button>

      {showEdit && onEditImage ? (
        <div className="absolute right-3 top-3">
          <Tooltip content="Edit image" className="whitespace-nowrap">
            <button
              type="button"
              onClick={onEditImage}
              className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 opacity-0 transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
            >
              <IconAccountBoxEditOutline className="" />
            </button>
          </Tooltip>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 p-4">
        <div className="text-lg font-semibold text-slate-900">
          {character.title}
        </div>
        <div className="text-sm text-slate-600">{description}</div>
        {summaryItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summaryItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {resolvedImageUrl ? (
        <Modal
          dismissible
          show={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          size="5xl"
          className="z-999"
        >
          <ModalHeader>{character.title}</ModalHeader>
          <ModalBody>
            <img
              src={resolvedImageUrl}
              alt={character.title}
              className="max-h-[75vh] w-full object-contain"
            />
          </ModalBody>
        </Modal>
      ) : null}
    </div>
  );
};
