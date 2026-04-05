import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import type { Character } from "../../api/types";
import { useStoriesQuery } from "../../hooks/useStories";
import { useImportCharactersMutation } from "../../queries/character/character-mutations";
import { useStoryCharactersQuery } from "../../queries/story/story-queries";
import { alert } from "../../utils/alert";
import { buildCharacterImportRows } from "../../utils/characterImportTable";
import { CharacterAvatar } from "./CharacterAvatar";

export type ImportCharactersModalProps = {
  isOpen: boolean;
  currentStoryId: string;
  onClose: () => void;
};

const CharacterCell = ({ character }: { character: Character }) => (
  <div className="flex items-center gap-2 text-sm text-slate-700">
    <CharacterAvatar
      name={character.title}
      imageUrl={character.imageUrl}
      size="sm"
      withBorder
    />
    <span className="truncate">{character.title}</span>
  </div>
);

export const ImportCharactersModal = ({
  isOpen,
  currentStoryId,
  onClose,
}: ImportCharactersModalProps) => {
  const storiesQuery = useStoriesQuery();
  const [sourceStoryId, setSourceStoryId] = useState<string | null>(null);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(
    new Set(),
  );
  const sourceCharactersQuery = useStoryCharactersQuery(sourceStoryId ?? "");
  const currentCharactersQuery = useStoryCharactersQuery(currentStoryId);
  const importMutation = useImportCharactersMutation();

  useEffect(() => {
    return () => {
      setSourceStoryId(null);
      setSelectedCharacterIds(new Set());
    };
  }, []);

  const stories = storiesQuery.data ?? [];
  const availableStories = useMemo(
    () => stories.filter((story) => story.id !== currentStoryId),
    [stories, currentStoryId],
  );

  const sourceStory = stories.find((story) => story.id === sourceStoryId);
  const currentStory = stories.find((story) => story.id === currentStoryId);
  const sourceCharacters = sourceCharactersQuery.data ?? [];
  const currentCharacters = currentCharactersQuery.data ?? [];

  const rows = useMemo(
    () => buildCharacterImportRows(sourceCharacters, currentCharacters),
    [sourceCharacters, currentCharacters],
  );
  const sourceTitles = useMemo(
    () => new Set(sourceCharacters.map((character) => character.title)),
    [sourceCharacters],
  );

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacterIds((prev) => {
      const next = new Set(prev);
      if (next.has(characterId)) {
        next.delete(characterId);
      } else {
        next.add(characterId);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (!sourceStoryId) {
      return;
    }
    const characterIds = Array.from(selectedCharacterIds);
    if (characterIds.length === 0) {
      return;
    }

    try {
      await importMutation.mutateAsync({
        fromStoryId: sourceStoryId,
        toStoryId: currentStoryId,
        characterIds,
      });
      alert.success("Characters imported successfully.");
      onClose();
      setSourceStoryId(null);
      setSelectedCharacterIds(new Set());
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      } else {
        alert.error("Unable to import characters.");
      }
    }
  };

  const isSelectingStory = !sourceStoryId;
  const isImporting = importMutation.isPending;

  return (
    <Modal
      dismissible
      show={isOpen}
      onClose={onClose}
      size="5xl"
      className="z-999"
    >
      <ModalHeader>Import Characters</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          {isSelectingStory ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Choose a story
                </p>
                <p className="text-sm text-slate-600">
                  Select a story to import characters from.
                </p>
              </div>

              {storiesQuery.isLoading ? (
                <div className="text-sm text-slate-500">Loading stories...</div>
              ) : null}

              {!storiesQuery.isLoading && availableStories.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No other stories available to import from.
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                {availableStories.map((story) => (
                  <div
                    key={story.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {story.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {story.stats.characters} characters
                        </p>
                      </div>
                      <Button
                        type="button"
                        color="gray"
                        onClick={() => setSourceStoryId(story.id)}
                      >
                        View characters
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Select characters to import
                  </p>
                  <p className="text-sm text-slate-600">
                    {sourceStory?.title ?? "Source story"}
                    to
                    {currentStory?.title ?? "Current story"}
                  </p>
                </div>
                <Button
                  type="button"
                  color="gray"
                  onClick={() => setSourceStoryId(null)}
                >
                  Choose another story
                </Button>
              </div>

              {sourceCharactersQuery.isLoading ||
              currentCharactersQuery.isLoading ? (
                <div className="text-sm text-slate-500">
                  Loading characters...
                </div>
              ) : null}

              {!sourceCharactersQuery.isLoading &&
              sourceCharacters.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  This story has no characters to import.
                </div>
              ) : null}

              {sourceCharacters.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-1/2 px-4 py-2">From story</th>
                        <th className="w-1/2 px-4 py-2">Current story</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => {
                        const leftCharacter = row.left;
                        const rightCharacter = row.right;
                        const leftSelected =
                          leftCharacter &&
                          selectedCharacterIds.has(leftCharacter.id);
                        const rightDimmed =
                          rightCharacter &&
                          sourceTitles.has(rightCharacter.title);
                        const leftClasses = leftCharacter
                          ? leftSelected
                            ? "border-2 border-sky-500 bg-sky-50"
                            : "border border-slate-200"
                          : "border border-dashed border-slate-200 bg-slate-50";
                        const rightClasses = rightCharacter
                          ? rightDimmed
                            ? "border border-slate-200 bg-slate-50 text-slate-400"
                            : "border border-slate-200"
                          : "border border-dashed border-slate-200 bg-slate-50";

                        return (
                          <tr key={`${row.letter}-${index}`}>
                            <td className="px-4 py-2 align-top">
                              {row.isGroupStart ? (
                                <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                  {row.letter}
                                </span>
                              ) : null}
                              {leftCharacter ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleCharacter(leftCharacter.id)
                                  }
                                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition bg-white hover:bg-gray-100 cursor-pointer ${leftClasses}`}
                                >
                                  <CharacterCell character={leftCharacter} />
                                </button>
                              ) : (
                                <div
                                  className={`flex w-full items-center rounded-md px-3 py-2 ${leftClasses}`}
                                >
                                  <span className="text-xs text-slate-400">
                                    --
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2 align-top">
                              {row.isGroupStart ? (
                                <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                  &nbsp;
                                </span>
                              ) : null}
                              {rightCharacter ? (
                                <div
                                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 ${rightClasses}`}
                                >
                                  <CharacterCell character={rightCharacter} />
                                </div>
                              ) : (
                                <div
                                  className={`flex w-full items-center rounded-md px-3 py-2 ${rightClasses}`}
                                >
                                  <span className="text-xs text-slate-400">
                                    --
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Selected characters: {selectedCharacterIds.size}
                </p>
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={selectedCharacterIds.size === 0 || isImporting}
                >
                  {isImporting ? "Importing..." : "Import characters"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};
