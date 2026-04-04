import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { CharacterCard } from "./CharacterCard";
import type { CharacterCardPopoverProps } from "./character-card.types";
import {
  useUpdateCharacterMutation,
  useUploadCharacterImageMutation,
} from "../../queries/character/character-mutations";
import { alert } from "../../utils/alert";
import { useClickOutside } from "../../hooks/useClickOutside";
import IconPencil from "~icons/mdi/pencil";

export const CharacterCardPopover = ({
  character,
  trigger,
  isOpen: isOpenProp,
  onOpenChange,
  onImageClick,
  onEditImage,
  onEditCharacter,
  showEdit,
  showEditCharacter,
  enableImageUpload = false,
  cardProps,
  className = "",
  popoverClassName = "",
}: CharacterCardPopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenProp ?? internalOpen;

  const setOpen = useMemo(() => {
    return onOpenChange ?? setInternalOpen;
  }, [onOpenChange]);

  const uploadImage = useUploadCharacterImageMutation();
  const updateCharacter = useUpdateCharacterMutation(character.storyId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(!isOpen);
    }
  };

  const onClickOutside = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const { containerRef } = useClickOutside<HTMLDivElement>({
    onClickOutside,
  });

  const handleEditImage = () => {
    if (!enableImageUpload) {
      onEditImage?.();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const upload = await uploadImage.mutateAsync(file);
      await updateCharacter.mutateAsync({
        characterId: character.id,
        imageUrl: upload.url,
      });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    } finally {
      event.target.value = "";
    }
  };

  const shouldShowEdit = showEdit ?? enableImageUpload;

  return (
    <div
      ref={containerRef}
      className={`character-card-popover relative inline-flex ${className}`}
    >
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={onTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {trigger}
      </span>

      <div
        className={`absolute left-0 top-full z-40 mt-2 ${popoverClassName} ${!isOpen ? "hidden" : ""}`}
      >
        <CharacterCard
          character={character}
          onImageClick={onImageClick}
          onEditImage={shouldShowEdit ? handleEditImage : onEditImage}
          showEdit={shouldShowEdit}
          {...cardProps}
        />
        {showEditCharacter && onEditCharacter ? (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEditCharacter();
              }}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-800"
            >
              <IconPencil className="h-4 w-4" />
              Edit Character
            </button>
          </div>
        ) : null}
        {enableImageUpload ? (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        ) : null}
      </div>
    </div>
  );
};
