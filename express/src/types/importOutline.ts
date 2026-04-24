export type ImportIssueLevel = "error" | "warning";
export type ImportOutlineType = "legacy" | "modern";

export type ImportIssue = {
  level: ImportIssueLevel;
  message: string;
  location?: string | null;
};

export type Tag = {
  id: string;
  name: string;
  variant: string | null;
  color: string | null;
};

export type Character = {
  id: string;
  name: string;
};

export type Snippet = {
  id: string;
  order: number;
  content: string[];
};

export type ElementType = "act" | "chapter" | "scene";

export interface BaseElementType<T extends ElementType> {
  type: T;
}

export interface ActElement extends BaseElementType<"act"> {
  id: string;
  title: string;
  content: string[];
}

export interface ChapterElement extends BaseElementType<"chapter"> {
  id: string;
  title: string;
  content: string[];
}

export interface SceneElement extends BaseElementType<"scene"> {
  id: string;
  title: string;
  povCharacterId: string | null;
  tagIds: string[];
  characterIds: string[];
  snippets: Snippet[];
  content: string[];
}

export type Element = ActElement | ChapterElement | SceneElement;

export type ImportParseResult = {
  elements: Element[];
  tags: Tag[];
  characters: Character[];
  issues: ImportIssue[];
};

export type ImportPlotCustomization = {
  id: string;
  name: string;
  color: string;
  isDefaultPlot: boolean;
  ignored: boolean;
};

export type ImportCustomizations = {
  ignoredCharacterIds: string[];
  characterMerges: Record<string, string>;
  plots: ImportPlotCustomization[];
};
