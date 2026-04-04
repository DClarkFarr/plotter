import { useEffect, useMemo, useRef } from "react";
import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import { useParams } from "@tanstack/react-router";

import type {
  CharacteristicFields,
  CharacterCustomAttribute as CharacterCustomAttributeApi,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "../../api/types";
import {
  CHARACTERISTIC_LABELS,
  CHARACTERISTIC_TEXTAREA_KEYS,
  CHARACTERISTIC_TEXT_KEYS,
  DEFAULT_CHARACTERISTIC_ORDER,
  type CharacteristicKey,
} from "../../utils/characterCharacteristics";
import { CharacterCustomAttributes } from "./CharacterCustomAttributes";
import { CharacterListsAccordion } from "./CharacterListsAccordion";
import { useCharacterModalStore } from "../../store/characterModalStore";
import { useCharacterEditorStore } from "../../store/characterEditorStore";
import {
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
} from "../../queries/character/character-mutations";
import { alert } from "../../utils/alert";
import { useDebounce } from "../../utils/useDebounce";
import type {
  CharacterCustomAttributeDraft,
  CharacterListDraft,
} from "../../types/characterEditor";

const buildCharacteristicsPayload = (
  state: Record<string, string>,
): CharacteristicFields | undefined => {
  const payload: Partial<Record<CharacteristicKey, string>> = {};

  CHARACTERISTIC_TEXTAREA_KEYS.forEach((key) => {
    const value = state[key]?.trim();
    if (value) {
      payload[key] = value;
    }
  });

  CHARACTERISTIC_TEXT_KEYS.forEach((key) => {
    const value = state[key]?.trim();
    if (value) {
      payload[key] = value;
    }
  });

  return Object.keys(payload).length > 0 ? payload : undefined;
};

const buildCustomAttributesPayload = (
  items: CharacterCustomAttributeDraft[],
): CharacterCustomAttributeApi[] | undefined => {
  const trimmed = items
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
    .filter((item) => item.label || item.value);

  if (trimmed.some((item) => !item.label || !item.value)) {
    throw new Error("Custom attributes require both label and value.");
  }

  return trimmed.length > 0 ? trimmed : undefined;
};

const buildListsPayload = (
  lists: CharacterListDraft[],
): { label: string; items: string[] }[] | undefined => {
  const cleaned = lists
    .map((list) => ({
      label: list.label.trim(),
      items: list.items.map((item) => item.trim()).filter(Boolean),
      isDefault: list.isDefault,
    }))
    .filter((list) => list.label || list.items.length > 0);

  if (cleaned.some((list) => !list.label)) {
    throw new Error("Custom lists require a label.");
  }

  const payload = cleaned.map(({ label, items }) => ({ label, items }));

  return payload.length > 0 ? payload : undefined;
};

export const CharacterModal = () => {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const { isOpen, mode, close } = useCharacterModalStore();
  const {
    character,
    title,
    description,
    characteristics,
    customAttributes,
    lists,
    setTitle,
    setDescription,
    setCharacteristic,
    setCustomAttributes,
    setLists,
  } = useCharacterEditorStore();
  const createCharacter = useCreateCharacterMutation(storyId);
  const updateCharacter = useUpdateCharacterMutation(storyId);
  const lastSavedRef = useRef<string>("");
  const skipAutoSaveRef = useRef(true);

  const payloadState = useMemo(() => {
    try {
      const payloadBase: CreateCharacterInput | UpdateCharacterInput = {
        title: title.trim(),
      };

      const trimmedDescription = description.trim();
      if (trimmedDescription) {
        payloadBase.description = trimmedDescription;
      }

      const characteristicsPayload =
        buildCharacteristicsPayload(characteristics);
      const customAttributesPayload =
        buildCustomAttributesPayload(customAttributes);
      const listsPayload = buildListsPayload(lists);

      if (characteristicsPayload) {
        payloadBase.characteristics = characteristicsPayload;
      }
      if (customAttributesPayload) {
        payloadBase.customCharacteristics = customAttributesPayload;
      }
      if (listsPayload) {
        payloadBase.lists = listsPayload;
      }

      return { payload: payloadBase, error: null };
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Invalid data");
      return { payload: null, error: err };
    }
  }, [characteristics, customAttributes, description, lists, title]);

  const debouncedSave = useDebounce(
    async (payload: UpdateCharacterInput, targetId: string) => {
      const serialized = JSON.stringify(payload);
      if (serialized === lastSavedRef.current) {
        return;
      }
      await updateCharacter.mutateAsync({ characterId: targetId, ...payload });
      lastSavedRef.current = serialized;
    },
    500,
  );

  useEffect(() => {
    if (!isOpen || mode !== "edit" || !character) {
      return;
    }

    if (payloadState.payload) {
      lastSavedRef.current = JSON.stringify(payloadState.payload);
    }
    skipAutoSaveRef.current = true;
  }, [character, isOpen, mode, payloadState.payload]);

  useEffect(() => {
    if (!isOpen || mode !== "edit" || !character) {
      return;
    }

    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }

    if (!payloadState.payload?.title?.trim()) {
      return;
    }

    if (!payloadState.payload) {
      return;
    }

    debouncedSave(payloadState.payload, character.id);
  }, [character, debouncedSave, isOpen, mode, payloadState.payload]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert.error("Character name is required.");
      return;
    }

    if (payloadState.error) {
      alert.error(payloadState.error.message);
      return;
    }

    const payload = payloadState.payload;
    if (!payload) {
      return;
    }

    try {
      if (mode === "edit" && character) {
        await updateCharacter.mutateAsync({
          characterId: character.id,
          ...payload,
        });
      } else {
        await createCharacter.mutateAsync({
          ...payload,
          title: payload.title || "Unnamed Character",
        });
      }
      close();
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    }
  };

  return (
    <Modal
      className="z-2000"
      show={isOpen}
      onClose={close}
      size="4xl"
      dismissible
    >
      <ModalHeader>
        {mode === "edit" ? "Edit Character" : "Create Character"}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Name
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Character name"
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Card Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short summary for cards"
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Characteristics
            </h3>
            <div className="mt-4 grid gap-3">
              {DEFAULT_CHARACTERISTIC_ORDER.map((key) => {
                const label = CHARACTERISTIC_LABELS[key];
                const isTextarea = CHARACTERISTIC_TEXTAREA_KEYS.includes(key);

                if (isTextarea) {
                  return (
                    <label key={key} className="text-sm text-slate-600">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                        {label}
                      </span>
                      <textarea
                        value={characteristics[key] ?? ""}
                        onChange={(event) =>
                          setCharacteristic(key, event.target.value)
                        }
                        rows={3}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  );
                }

                return (
                  <label key={key} className="text-sm text-slate-600">
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                      {label}
                    </span>
                    <input
                      value={characteristics[key] ?? ""}
                      onChange={(event) =>
                        setCharacteristic(key, event.target.value)
                      }
                      type="text"
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Custom Attributes
            </h3>
            <div className="mt-4">
              <CharacterCustomAttributes
                items={customAttributes}
                onChange={setCustomAttributes}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Lists
            </h3>
            <div className="mt-4">
              <CharacterListsAccordion lists={lists} onChange={setLists} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button color="light" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createCharacter.isPending || updateCharacter.isPending}
            >
              {mode === "edit" ? "Save Changes" : "Create Character"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
