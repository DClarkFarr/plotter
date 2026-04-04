import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import IconDelete from "~icons/mdi/delete";
import { useStoryCharactersQuery } from "../../queries/story/story-queries";
import {
  useDeleteCharacterMutation,
  useUpdateCharacterMutation,
} from "../../queries/character/character-mutations";
import type { Character } from "../../api/types";
import { CharacterAvatar } from "./CharacterAvatar";
import { CharacterCardPopover } from "../character/CharacterCardPopover";
import { alert } from "../../utils/alert";

export function ManageCharactersPanel() {
  const { storyId } = useParams({ from: "/dashboard/story/$storyId" });
  const charactersQuery = useStoryCharactersQuery(storyId);
  const characters = charactersQuery.data ?? [];
  const updateCharacter = useUpdateCharacterMutation(storyId);
  const deleteCharacter = useDeleteCharacterMutation();
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, { title: string; description: string }>
  >({});

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

  const handleDraftChange = (
    character: Character,
    field: "title" | "description",
    value: string,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [character.id]: {
        title: prev[character.id]?.title ?? character.title,
        description:
          prev[character.id]?.description ?? character.description ?? "",
        [field]: value,
      },
    }));
  };

  const commitCharacterUpdate = async (character: Character) => {
    const draft = drafts[character.id];
    if (!draft) {
      return;
    }

    const nextTitle = draft.title.trim();
    const nextDescription = draft.description;
    if (!nextTitle) {
      setDrafts((prev) => ({
        ...prev,
        [character.id]: {
          title: character.title,
          description: character.description ?? "",
        },
      }));
      return;
    }

    const payload = {
      ...(nextTitle !== character.title && { title: nextTitle }),
      ...(nextDescription !== (character.description ?? "") && {
        description: nextDescription,
      }),
    };

    if (Object.keys(payload).length === 0) {
      return;
    }

    try {
      await updateCharacter.mutateAsync({
        characterId: character.id,
        ...payload,
      });
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      }
    }
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

  if (charactersQuery.isLoading) {
    return <div className="text-sm text-slate-500">Loading characters...</div>;
  }

  if (charactersQuery.error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        Unable to load characters. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Manage Characters
        </p>
        <p className="text-sm text-slate-600">
          Update images, names, and descriptions in place.
        </p>
      </div>

      <div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search characters"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      {characters.length === 0 ? (
        <div className="text-sm text-slate-500">
          No characters yet. Add characters from scenes to get started.
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-sm text-slate-500">No characters found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCharacters.map((character) => {
            const draft = drafts[character.id];
            const titleValue = draft?.title ?? character.title;
            const descriptionValue =
              draft?.description ?? character.description ?? "";

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
                  />

                  <input
                    value={titleValue}
                    onChange={(event) =>
                      handleDraftChange(character, "title", event.target.value)
                    }
                    onBlur={() => commitCharacterUpdate(character)}
                    className="w-full text-xl font-semibold text-slate-900 rounded-md px-2 -mx-2 py-1 transition-colors bg-slate-100 focus:bg-slate-200 hover:bg-slate-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="ml-auto rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                    onClick={() => handleDelete(character)}
                  >
                    <IconDelete />
                  </button>
                </div>
                <div className="mt-3">
                  <textarea
                    value={descriptionValue}
                    onChange={(event) =>
                      handleDraftChange(
                        character,
                        "description",
                        event.target.value,
                      )
                    }
                    onBlur={() => commitCharacterUpdate(character)}
                    placeholder="Character description"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
