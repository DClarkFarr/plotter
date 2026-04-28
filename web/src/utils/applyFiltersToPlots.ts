import type { Character, Plot, Scene, Tag } from "../api/types";
import type { StoryFilter } from "../store/storyStore.types";

export type FilteredPlotsResult = {
  includedSceneIds: string[];
  includedPlotIds: string[];
};

type ApplyFiltersOptions = {
  tags?: Tag[];
  characters?: Character[];
};

export const applyFiltersToPlots = (
  plots: Plot[],
  scenes: Scene[],
  filters: StoryFilter[],
  options: ApplyFiltersOptions = {},
): FilteredPlotsResult => {
  const { tags = [], characters = [] } = options;
  const normalizedFilters = filters.map((filter) => ({
    ...filter,
    value1: filter.value1.trim(),
    value2: filter.value2?.trim(),
  }));

  if (normalizedFilters.length === 0) {
    return {
      includedSceneIds: scenes.map((scene) => scene.id),
      includedPlotIds: plots.map((plot) => plot.id),
    };
  }

  const normalized = (value: string) => value.trim().toLowerCase();
  const tagIdByName = new Map(
    tags.map((tag) => [normalized(tag.name), tag.id]),
  );
  const characterIdByTitle = new Map(
    characters.map((character) => [normalized(character.title), character.id]),
  );

  const plotFilters = normalizedFilters.filter(
    (filter) => filter.type === "plot",
  );
  const tagFilters = normalizedFilters.filter(
    (filter) => filter.type === "tag",
  );
  const characterFilters = normalizedFilters.filter(
    (filter) => filter.type === "character",
  );
  const searchFilters = normalizedFilters.filter(
    (filter) => filter.type === "search",
  );

  const matchesPlotFilter = (plot: Plot) => {
    if (plotFilters.length === 0) {
      return true;
    }

    const plotTitle = normalized(plot.title);
    return plotFilters.some(
      (filter) => plotTitle === normalized(filter.value1),
    );
  };

  const matchesTagFilter = (scene: Scene) => {
    if (tagFilters.length === 0) {
      return true;
    }

    return tagFilters.some((filter) => {
      const tagId = tagIdByName.get(normalized(filter.value1));
      if (!tagId) {
        return false;
      }

      if (!scene.tags?.includes(tagId)) {
        return false;
      }

      if (!filter.value2 || filter.value2.toLowerCase() === "all") {
        return true;
      }

      return (scene.tagVariants ?? []).some(
        (variant) =>
          variant.tagId === tagId &&
          normalized(variant.variant) === normalized(filter.value2 ?? ""),
      );
    });
  };

  const matchesCharacterFilter = (scene: Scene) => {
    if (characterFilters.length === 0) {
      return true;
    }

    return characterFilters.some((filter) => {
      const characterId = characterIdByTitle.get(normalized(filter.value1));
      if (!characterId) {
        return false;
      }

      return scene.pov === characterId;
    });
  };

  const matchesSearchFilter = (scene: Scene) => {
    if (searchFilters.length === 0) {
      return true;
    }

    return searchFilters.some((filter) => {
      const query = normalized(filter.value1);
      const title = normalized(scene.title ?? "");
      const description = normalized(scene.description ?? "");
      return title.includes(query) || description.includes(query);
    });
  };

  const plotById = new Map(plots.map((p) => [p.id, p]));
  const includedSceneIds: string[] = [];
  const includedPlotIdSet = new Set<string>();
  scenes.forEach((scene) => {
    const plot = plotById.get(scene.plotId);
    if (!plot || !matchesPlotFilter(plot)) {
      return;
    }

    const matches =
      matchesTagFilter(scene) &&
      matchesCharacterFilter(scene) &&
      matchesSearchFilter(scene);
    if (matches) {
      includedSceneIds.push(scene.id);
      includedPlotIdSet.add(scene.plotId);
    }
  });

  return {
    includedSceneIds,
    includedPlotIds: [...includedPlotIdSet],
  };
};
