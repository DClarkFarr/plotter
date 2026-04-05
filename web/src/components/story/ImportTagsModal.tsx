import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import type { Tag } from "../../api/types";
import { useStoriesQuery } from "../../hooks/useStories";
import { useStoryTagsQuery } from "../../queries/story/story-queries";
import { useImportTagsMutation } from "../../queries/tag/tag-mutation";
import { alert } from "../../utils/alert";
import { buildTagImportRows } from "../../utils/tagImportTable";

export type ImportTagsModalProps = {
  isOpen: boolean;
  currentStoryId: string;
  onClose: () => void;
};

const TagCell = ({ tag }: { tag: Tag }) => (
  <div className="flex items-center gap-2 text-sm text-slate-700 ">
    <span
      className="h-3 w-3 rounded-full border border-slate-900"
      style={{ backgroundColor: tag.color }}
    />
    <span className="truncate">{tag.name}</span>
  </div>
);

export const ImportTagsModal = ({
  isOpen,
  currentStoryId,
  onClose,
}: ImportTagsModalProps) => {
  const storiesQuery = useStoriesQuery();
  const [sourceStoryId, setSourceStoryId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const sourceTagsQuery = useStoryTagsQuery(sourceStoryId ?? "");
  const currentTagsQuery = useStoryTagsQuery(currentStoryId);
  const importMutation = useImportTagsMutation();

  useEffect(() => {
    return () => {
      setSourceStoryId(null);
      setSelectedTagIds(new Set());
    };
  }, []);

  const stories = storiesQuery.data ?? [];
  const availableStories = useMemo(
    () => stories.filter((story) => story.id !== currentStoryId),
    [stories, currentStoryId],
  );

  const sourceStory = stories.find((story) => story.id === sourceStoryId);
  const currentStory = stories.find((story) => story.id === currentStoryId);
  const sourceTags = sourceTagsQuery.data ?? [];
  const currentTags = currentTagsQuery.data ?? [];

  const rows = useMemo(
    () => buildTagImportRows(sourceTags, currentTags),
    [sourceTags, currentTags],
  );
  const sourceNames = useMemo(
    () => new Set(sourceTags.map((tag) => tag.name)),
    [sourceTags],
  );

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (!sourceStoryId) {
      return;
    }
    const tagIds = Array.from(selectedTagIds);
    if (tagIds.length === 0) {
      return;
    }

    try {
      await importMutation.mutateAsync({
        fromStoryId: sourceStoryId,
        toStoryId: currentStoryId,
        tagIds,
      });
      alert.success("Tags imported successfully.");
      onClose();
      setSourceStoryId(null);
      setSelectedTagIds(new Set());
    } catch (error) {
      if (error instanceof Error) {
        alert.error(error.message);
      } else {
        alert.error("Unable to import tags.");
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
      <ModalHeader>Import Tags</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          {isSelectingStory ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Choose a story
                </p>
                <p className="text-sm text-slate-600">
                  Select a story to import tags from.
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
                          {story.stats.tags} tags
                        </p>
                      </div>
                      <Button
                        type="button"
                        color="gray"
                        onClick={() => setSourceStoryId(story.id)}
                      >
                        View tags
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
                    Select tags to import
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

              {sourceTagsQuery.isLoading || currentTagsQuery.isLoading ? (
                <div className="text-sm text-slate-500">Loading tags...</div>
              ) : null}

              {!sourceTagsQuery.isLoading && sourceTags.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  This story has no tags to import.
                </div>
              ) : null}

              {sourceTags.length > 0 ? (
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
                        const leftTag = row.left;
                        const rightTag = row.right;
                        const leftSelected =
                          leftTag && selectedTagIds.has(leftTag.id);
                        const rightDimmed =
                          rightTag && sourceNames.has(rightTag.name);
                        const leftClasses = leftTag
                          ? leftSelected
                            ? "border-2 border-sky-500 bg-sky-50"
                            : "border border-slate-200"
                          : "border border-dashed border-slate-200 bg-slate-50";
                        const rightClasses = rightTag
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
                              {leftTag ? (
                                <button
                                  type="button"
                                  onClick={() => toggleTag(leftTag.id)}
                                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition bg-white hover:bg-gray-100 cursor-pointer ${leftClasses}`}
                                >
                                  <TagCell tag={leftTag} />
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
                              {rightTag ? (
                                <div
                                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 ${rightClasses}`}
                                >
                                  <TagCell tag={rightTag} />
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
                  Selected tags: {selectedTagIds.size}
                </p>
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={selectedTagIds.size === 0 || isImporting}
                >
                  {isImporting ? "Importing..." : "Import tags"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};
