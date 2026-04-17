import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { CustomTooltip } from "../helpers/CustomTooltip";
import { useParams } from "@tanstack/react-router";
import IconDelete from "~icons/mdi/delete";
import IconPencil from "~icons/mdi/pencil";
import IconImport from "~icons/mdi/import";
import { useStoryCharactersQuery } from "../../queries/story/story-queries";
import { useDeleteCharacterMutation } from "../../queries/character/character-mutations";
import { type Character } from "../../api/types";
import { CharacterAvatar } from "./CharacterAvatar";
import { CharacterCardPopover } from "../character/CharacterCardPopover";
import { alert } from "../../utils/alert";
import { useCharacterModalStore } from "../../store/characterModalStore";
import { CHARACTERISTIC_LABELS } from "../../utils/characterCharacteristics";
import { ImportCharactersModal } from "./ImportCharactersModal";

export function ManageCharactersPanel() {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const {
    data: charactersRaw,
    isLoading,
    error,
  } = useStoryCharactersQuery(storyId);
  const deleteCharacter = useDeleteCharacterMutation();
  const [query, setQuery] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const openCreate = useCharacterModalStore((state) => state.openCreate);
  const openEdit = useCharacterModalStore((state) => state.openEdit);

  const characters = useMemo(() => {
    return charactersRaw || [];
  }, [charactersRaw]);
  const sortedCharacters = useMemo(
    () =>
      [...characters].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      ),
    [characters],
  );

  const filteredCharacters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return sortedCharacters;
    }

    return sortedCharacters.filter((character) =>
      character.title.toLowerCase().includes(normalized),
    );
  }, [query, sortedCharacters]);

  const buildSummary = (character: Character) => {
    const characteristics = character.characteristics;
    if (!characteristics) {
      return [];
    }

    const keys = [
      "age",
      "height",
      "weight",
      "build",
      "eyeColor",
      "hair",
    ] as const;

    return keys
      .map((key) => {
        const value = characteristics[key];
        if (value === undefined || value === null || value === "") {
          return null;
        }
        return `${CHARACTERISTIC_LABELS[key]}: ${value}`;
      })
      .filter((entry): entry is string => Boolean(entry));
  };

  const handleDelete = async (character: Character) => {
    try {
      await deleteCharacter.mutateAsync({ storyId, characterId: character.id });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading characters...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        Unable to load characters. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Manage Characters
          </p>
          <p className="text-sm text-slate-600">
            Create and edit character details from a dedicated modal.
          </p>
        </div>
        <CustomTooltip
          content="import characters from another story"
          className="whitespace-nowrap"
        >
          <Button
            type="button"
            color="gray"
            onClick={() => setIsImportOpen(true)}
          >
            <IconImport className="" /> Characters
          </Button>
        </CustomTooltip>
      </div>

      <div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search characters"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {characters.length} characters
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700"
        >
          Add Character
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-sm text-slate-500">
          No characters yet. Add a character to get started.
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-sm text-slate-500">No characters found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCharacters.map((character) => {
            return (
              <div
                key={character.id}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <CharacterCardPopover
                    character={character}
                    trigger={
                      <CharacterAvatar
                        name={character.title}
                        imageUrl={character.imageUrl}
                        withBorder
                        size="md"
                      />
                    }
                    className="shrink-0"
                    popoverClassName="z-50"
                    enableImageUpload
                    showEditCharacter
                    onEditCharacter={() => openEdit(character)}
                  />

                  <div className="flex-1">
                    <div className="text-lg font-semibold text-slate-900">
                      {character.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {character.description || "No card description yet."}
                    </div>
                    {buildSummary(character).length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {buildSummary(character).map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      onClick={() => openEdit(character)}
                    >
                      <IconPencil />
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                      onClick={() => handleDelete(character)}
                    >
                      <IconDelete />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ImportCharactersModal
        isOpen={isImportOpen}
        currentStoryId={storyId}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
