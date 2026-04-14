import { TabItem, Tabs } from "flowbite-react";
import type {
  ImportCustomizations,
  ImportOutlineParseCharacter,
  ImportOutlineParseElement,
  ImportOutlineParseTag,
} from "../../api/types";
import type { ChangeEvent } from "react";

export type ImportOutlinePreviewTabsProps = {
  characters: ImportOutlineParseCharacter[];
  elements: ImportOutlineParseElement[];
  tags: ImportOutlineParseTag[];
  customizations: ImportCustomizations;
  onChangeTags: (next: ImportOutlineParseTag[]) => void;
  onCustomizationChange: (next: ImportCustomizations) => void;
};

// ─── Characters Tab ───────────────────────────────────────────────────────────

type CharactersTabProps = {
  characters: ImportOutlineParseCharacter[];
  customizations: ImportCustomizations;
  onCustomizationChange: (next: ImportCustomizations) => void;
};

const CharactersTab = ({
  characters,
  customizations,
  onCustomizationChange,
}: CharactersTabProps) => {
  if (characters.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No characters were detected in this document.
      </p>
    );
  }

  const { ignoredCharacterIds, characterMerges } = customizations;

  const toggleIgnore = (id: string) => {
    const isIgnored = ignoredCharacterIds.includes(id);
    const nextIgnored = isIgnored
      ? ignoredCharacterIds.filter((x) => x !== id)
      : [...ignoredCharacterIds, id];

    // If we're ignoring this character, remove any merge that targets it or
    // originates from it.
    const nextMerges = { ...characterMerges };
    if (!isIgnored) {
      delete nextMerges[id];
      for (const [from, to] of Object.entries(nextMerges)) {
        if (to === id) {
          delete nextMerges[from];
        }
      }
    }

    onCustomizationChange({
      ...customizations,
      ignoredCharacterIds: nextIgnored,
      characterMerges: nextMerges,
    });
  };

  const setMerge = (fromId: string, toId: string) => {
    onCustomizationChange({
      ...customizations,
      characterMerges: { ...characterMerges, [fromId]: toId },
    });
  };

  const clearMerge = (fromId: string) => {
    const next = { ...characterMerges };
    delete next[fromId];
    onCustomizationChange({ ...customizations, characterMerges: next });
  };

  // Characters that are valid merge targets for a given row:
  // not ignored, not the source character itself
  const mergeTargetsFor = (sourceId: string) =>
    characters.filter(
      (c) => c.id !== sourceId && !ignoredCharacterIds.includes(c.id),
    );

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {characters.map((character) => {
        const isIgnored = ignoredCharacterIds.includes(character.id);
        const mergeTarget = characterMerges[character.id];
        const mergeTargetName = mergeTarget
          ? (characters.find((c) => c.id === mergeTarget)?.name ?? mergeTarget)
          : null;

        return (
          <li
            key={character.id}
            className={[
              "flex items-center justify-between gap-4 py-2 text-sm",
              isIgnored ? "opacity-50 line-through" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="flex-1 truncate text-slate-800">
              {character.name}
            </span>

            <div className="flex shrink-0 items-center gap-3">
              {/* Merge with control */}
              {!isIgnored && (
                <div className="flex items-center gap-1">
                  {mergeTargetName ? (
                    <>
                      <span className="text-xs text-slate-500">
                        → {mergeTargetName}
                      </span>
                      <button
                        type="button"
                        aria-label="Clear merge"
                        className="text-xs text-slate-400 hover:text-slate-700"
                        onClick={() => clearMerge(character.id)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <select
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 focus:outline-none"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setMerge(character.id, e.target.value);
                        }
                      }}
                    >
                      <option value="">Merge with…</option>
                      {mergeTargetsFor(character.id).map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Ignore checkbox */}
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-700"
                  checked={isIgnored}
                  onChange={() => toggleIgnore(character.id)}
                />
                Ignore
              </label>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─── Elements Tab ─────────────────────────────────────────────────────────────

type ElementsTabProps = {
  elements: ImportOutlineParseElement[];
  characters: ImportOutlineParseCharacter[];
  tags: ImportOutlineParseTag[];
};

const ElementsTab = ({ elements, characters, tags }: ElementsTabProps) => {
  if (elements.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No elements were detected in this document.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {elements.map((element) => {
        if (element.type === "act") {
          return (
            <li key={element.id} className="text-base font-bold text-slate-800">
              {element.title}
            </li>
          );
        }

        if (element.type === "chapter") {
          return (
            <li
              key={element.id}
              className="pl-4 text-sm font-semibold text-slate-700"
            >
              {element.title}
            </li>
          );
        }

        // scene
        const povCharacter = element.povCharacterId
          ? characters.find((c) => c.id === element.povCharacterId)
          : null;

        const sceneTags = element.tagIds
          .map((id) => tags.find((t) => t.id === id))
          .filter((t): t is ImportOutlineParseTag => t !== undefined);

        return (
          <li key={element.id} className="pl-8">
            <span className="text-sm text-slate-700">{element.title}</span>
            {(povCharacter || sceneTags.length > 0) && (
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                {povCharacter && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {povCharacter.name}
                  </span>
                )}
                {sceneTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {tag.variant ? `${tag.name}: ${tag.variant}` : tag.name}
                  </span>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// ─── Tags & Plots Tab ─────────────────────────────────────────────────────────

type TagsTabProps = {
  tags: ImportOutlineParseTag[];
  customizations: ImportCustomizations;
  onCustomizationChange: (next: ImportCustomizations) => void;
};

const TagsTab = ({
  tags,
  customizations,
  onCustomizationChange,
}: TagsTabProps) => {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No tags were detected in this document.
      </p>
    );
  }

  const { plotTagIds } = customizations;

  // Group by tag name
  const groups = new Map<string, ImportOutlineParseTag[]>();
  for (const tag of tags) {
    if (tag.id === "main_plot_id") {
      continue;
    }

    const existing = groups.get(tag.name);
    if (existing) {
      existing.push(tag);
    } else {
      groups.set(tag.name, [tag]);
    }
  }

  const togglePlot = (tagId: string) => {
    const isPlot = plotTagIds.includes(tagId);
    const nextPlotTagIds = isPlot
      ? plotTagIds.filter((x) => x !== tagId)
      : [...plotTagIds, tagId];
    onCustomizationChange({ ...customizations, plotTagIds: nextPlotTagIds });
  };

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {[...groups.entries()].map(([name, group]) => {
        const nullVariantEntry = group.find((t) => t.variant === null);
        const variantEntries = group.filter((t) => t.variant !== null);
        const isPlot = nullVariantEntry
          ? plotTagIds.includes(nullVariantEntry.id)
          : false;

        return (
          <li key={name} className="py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-800">
                  {name}
                </span>
                {variantEntries.map((t) => (
                  <span key={t.id} className="text-xs text-slate-500">
                    {name}: {t.variant}{" "}
                    <span className="ml-1 text-slate-400">(tag only)</span>
                  </span>
                ))}
              </div>

              <div className="shrink-0">
                {nullVariantEntry ? (
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-slate-700"
                      checked={isPlot}
                      onChange={() => togglePlot(nullVariantEntry.id)}
                    />
                    Convert to plot
                  </label>
                ) : (
                  <span className="text-xs text-slate-400">Tag only</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const colors = [
  "#ff6467",
  "#ffb86a",
  "#fee685",
  "#a2f4fd",
  "#bedbff",
  "#f4a8ff",
  "#ffa1ad",
];

type PlotsTabProps = {
  tags: ImportOutlineParseTag[];
  customizations: ImportCustomizations;
  onChangeTags: (next: ImportOutlineParseTag[]) => void;
};

const PlotsTab = ({ tags, onChangeTags, customizations }: PlotsTabProps) => {
  const plotTagIds = customizations.plotTagIds;
  const plots = tags.filter((t) => plotTagIds.includes(t.id));

  const handleToggleMainPlot = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.currentTarget.name;
    const isChecked = e.currentTarget.checked;

    const updatedTags = tags.map((t) => {
      return t.id === name
        ? { ...t, isDefaultPlot: isChecked }
        : { ...t, isDefaultPlot: false };
    });

    console.log("udating tags", updatedTags, "from", name, "and", isChecked);
    onChangeTags(updatedTags);
  };

  const handleChangeColor = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    const updatedTags = tags.map((t): ImportOutlineParseTag => {
      return t.id === name ? { ...t, color: value } : t;
    });

    onChangeTags(updatedTags);
  };

  return (
    <ul className="flex flex-col divide-y divide-slate-300">
      {plots.map((plot, pi) => (
        <li key={plot.id} className="py-2">
          <div className="flex items-center gap-4">
            <div>
              <input
                type="color"
                name={plot.id}
                value={plot.color ?? colors[pi] ?? ""}
                onChange={handleChangeColor}
              />
            </div>
            <div>{plot.name}</div>
            <div className="ml-auto">
              <label>
                <input
                  className="mr-2 inline-block"
                  type="checkbox"
                  name={plot.id}
                  onChange={handleToggleMainPlot}
                  checked={plot.isDefaultPlot}
                />
                <span>Make Default Plot</span>
              </label>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────

export const ImportOutlinePreviewTabs = ({
  characters,
  elements,
  tags,
  customizations,
  onChangeTags,
  onCustomizationChange,
}: ImportOutlinePreviewTabsProps) => {
  return (
    <Tabs aria-label="Import preview">
      <TabItem title="Characters">
        <CharactersTab
          characters={characters}
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
        />
      </TabItem>
      <TabItem title="Elements">
        <ElementsTab elements={elements} characters={characters} tags={tags} />
      </TabItem>
      <TabItem title="Tags">
        <TagsTab
          tags={tags}
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
        />
      </TabItem>
      <TabItem title="Plots">
        <PlotsTab
          tags={tags}
          customizations={customizations}
          onChangeTags={onChangeTags}
        />
      </TabItem>
    </Tabs>
  );
};
