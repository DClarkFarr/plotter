import { TabItem, Tabs } from "flowbite-react";
import type {
  ImportCustomizations,
  ImportOutlineParseCharacter,
  ImportOutlineParseElement,
  ImportOutlineParsePlot,
  ImportOutlineParseTag,
  ImportPlotCustomization,
} from "../../api/types";
import { ColorPaletteDropdown } from "../ui/ColorPaletteDropdown";
import { DEFAULT_PALETTE_COLORS } from "../../types/color";

export type ImportOutlinePreviewTabsProps = {
  characters: ImportOutlineParseCharacter[];
  elements: ImportOutlineParseElement[];
  tags: ImportOutlineParseTag[];
  plots: ImportOutlineParsePlot[];
  customizations: ImportCustomizations;
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
  plots: ImportOutlineParsePlot[];
};

const ElementsTab = ({
  elements,
  characters,
  tags,
  plots,
}: ElementsTabProps) => {
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

        const scenePlots = (element.plotIds ?? [])
          .map((id) => plots.find((plot) => plot.id === id))
          .filter((plot): plot is ImportOutlineParsePlot => plot !== undefined);

        return (
          <li key={element.id} className="pl-8">
            <span className="text-sm text-slate-700">{element.title}</span>
            {(povCharacter ||
              sceneTags.length > 0 ||
              scenePlots.length > 0) && (
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                {povCharacter && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {povCharacter.name}
                  </span>
                )}
                {scenePlots.map((plot) => (
                  <span
                    key={plot.id}
                    className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700"
                  >
                    {plot.name}
                  </span>
                ))}
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

  const plotIds = new Set(customizations.plots.map((p) => p.id));

  // Group by tag name (excluding main_plot_id which is always in customizations)
  const groups = new Map<string, ImportOutlineParseTag[]>();
  for (const tag of tags) {
    const existing = groups.get(tag.name);
    if (existing) {
      existing.push(tag);
    } else {
      groups.set(tag.name, [tag]);
    }
  }

  const togglePlot = (tag: ImportOutlineParseTag) => {
    const isPlot = plotIds.has(tag.id);
    if (isPlot) {
      // Remove this plot entry; if it was default, restore Main as default
      const removed = customizations.plots.find((p) => p.id === tag.id);
      const wasDefault = removed?.isDefaultPlot ?? false;
      const nextPlots = customizations.plots.filter((p) => p.id !== tag.id);
      const finalPlots = wasDefault
        ? nextPlots.map((p) =>
            p.id === "main_plot_id" ? { ...p, isDefaultPlot: true } : p,
          )
        : nextPlots;
      onCustomizationChange({ ...customizations, plots: finalPlots });
    } else {
      const idx = customizations.plots.filter(
        (p) => p.id !== "main_plot_id",
      ).length;
      const newEntry: ImportPlotCustomization = {
        id: tag.id,
        name: tag.name,
        color:
          DEFAULT_PALETTE_COLORS[idx % DEFAULT_PALETTE_COLORS.length] ??
          "#729cfd",
        isDefaultPlot: false,
        ignored: false,
      };
      onCustomizationChange({
        ...customizations,
        plots: [...customizations.plots, newEntry],
      });
    }
  };

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {[...groups.entries()].map(([name, group]) => {
        const nullVariantEntry = group.find((t) => t.variant === null);
        const variantEntries = group.filter((t) => t.variant !== null);
        const isPlot = nullVariantEntry
          ? plotIds.has(nullVariantEntry.id)
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
                      onChange={() => togglePlot(nullVariantEntry)}
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

type PlotsTabProps = {
  customizations: ImportCustomizations;
  onCustomizationChange: (next: ImportCustomizations) => void;
};

const PlotsTab = ({ customizations, onCustomizationChange }: PlotsTabProps) => {
  const { plots } = customizations;

  const handleChangeColor = (id: string, color: string) => {
    onCustomizationChange({
      ...customizations,
      plots: plots.map((p) => (p.id === id ? { ...p, color } : p)),
    });
  };

  const handleToggleDefault = (id: string) => {
    onCustomizationChange({
      ...customizations,
      plots: plots.map((p) => ({ ...p, isDefaultPlot: p.id === id })),
    });
  };

  const handleToggleIgnore = (id: string) => {
    const entry = plots.find((p) => p.id === id);
    const wasDefault = entry?.isDefaultPlot ?? false;
    const nextPlots = plots.map((p) =>
      p.id === id ? { ...p, ignored: !p.ignored } : p,
    );
    // If we just ignored the default, restore Main as default
    const finalPlots =
      wasDefault && !entry?.ignored
        ? nextPlots.map((p) =>
            p.id === "main_plot_id" ? { ...p, isDefaultPlot: true } : p,
          )
        : nextPlots;
    onCustomizationChange({ ...customizations, plots: finalPlots });
  };

  if (plots.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No plots configured. Plots detected during import appear here. You can
        also convert tags to plots in the Tags tab.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-200">
      {plots.map((plot) => (
        <li
          key={plot.id}
          className={[
            "flex items-center gap-4 py-2 text-sm",
            plot.ignored ? "opacity-40" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ColorPaletteDropdown
            storyId={null}
            value={plot.color}
            onChange={(color) => handleChangeColor(plot.id, color)}
          />
          <span className="flex-1 text-slate-800">{plot.name}</span>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-slate-700"
              checked={plot.isDefaultPlot && !plot.ignored}
              disabled={plot.ignored}
              onChange={() => handleToggleDefault(plot.id)}
            />
            Make Default Plot
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-slate-700"
              checked={plot.ignored}
              onChange={() => handleToggleIgnore(plot.id)}
            />
            Ignore
          </label>
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
  plots,
  customizations,
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
        <ElementsTab
          elements={elements}
          characters={characters}
          tags={tags}
          plots={plots}
        />
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
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
        />
      </TabItem>
    </Tabs>
  );
};
