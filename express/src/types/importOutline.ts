export type ImportIssueLevel = "error" | "warning";

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

export type ActElement = {
  id: string;
  type: "act";
  title: string;
  content: string[];
};

export type ChapterElement = {
  id: string;
  type: "chapter";
  title: string;
  actId: string;
  content: string[];
};

export type SceneElement = {
  id: string;
  type: "scene";
  title: string;
  chapterId: string;
  povCharacterId: string | null;
  tagIds: string[];
  characterIds: string[];
  snippets: Snippet[];
  content: string[];
};

export type Element = ActElement | ChapterElement | SceneElement;

export type ImportParseResult = {
  elements: Element[];
  tags: Tag[];
  characters: Character[];
  issues: ImportIssue[];
};
