import { parseOffice } from "officeparser";
import type {
  HeadingMetadata,
  OfficeContentNode,
  OfficeParserAST,
} from "officeparser";
import { renderNodeToHtml } from "../utils/docxHtml";
import { buildCharacterKey, buildTagKey } from "../utils/importNormalization";
import type {
  ActElement,
  ChapterElement,
  ImportIssue,
  ImportParseResult,
  Tag,
  Character,
  SceneElement,
  Snippet,
} from "../types/importOutline";

const snippetIndentThresholdTwips = 600;

const getHeadingLevel = (node: OfficeContentNode): number | null => {
  if (node.type !== "heading") {
    return null;
  }

  const metadata = node.metadata as HeadingMetadata | undefined;
  return typeof metadata?.level === "number" ? metadata.level : null;
};

const getHeadingText = (node: OfficeContentNode): string =>
  (node.text ?? "").trim();

const getParagraphIndentTwips = (node: OfficeContentNode): number => {
  if (!node.rawContent) {
    return 0;
  }

  const match = node.rawContent.match(/w:ind[^>]*w:left="(\d+)"/);
  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : 0;
};

const createEmptyResult = (): ImportParseResult => ({
  elements: [],
  tags: [],
  characters: [],
  issues: [],
});

const addIssue = (
  issues: ImportIssue[],
  level: ImportIssue["level"],
  message: string,
  location?: string | null,
) => {
  issues.push({ level, message, location: location ?? null });
};

type TextRun = {
  text: string;
  formatting?: OfficeContentNode["formatting"];
};

const collectTextRuns = (node: OfficeContentNode): TextRun[] => {
  if (node.type === "text") {
    return [{ text: node.text ?? "", formatting: node.formatting }];
  }

  if (!node.children) {
    return [];
  }

  return node.children.flatMap((child) => collectTextRuns(child));
};

const resolveTagColor = (runs: TextRun[], tagToken: string): string | null => {
  for (const run of runs) {
    if (!run.text.includes(tagToken)) {
      continue;
    }

    return run.formatting?.backgroundColor ?? run.formatting?.color ?? null;
  }

  return null;
};

type ParsedHeading = {
  povName: string | null;
  title: string;
  tags: Array<{ name: string; variant: string | null; color: string | null }>;
};

const parseSceneHeading = (node: OfficeContentNode): ParsedHeading => {
  const runs = collectTextRuns(node);
  const headingText = getHeadingText(node);
  const colonIndex = headingText.indexOf(":");
  const povName =
    colonIndex >= 0 ? headingText.slice(0, colonIndex).trim() : null;
  const remainder =
    colonIndex >= 0 ? headingText.slice(colonIndex + 1) : headingText;
  const tagMatches = [...remainder.matchAll(/\[[^\]]+\]/g)];

  const tags = tagMatches.map((match) => {
    const token = match[0];
    const raw = token.slice(1, -1).trim();
    const [nameRaw, variantRaw] = raw.split(":");

    return {
      name: (nameRaw ?? "").trim(),
      variant: variantRaw ? variantRaw.trim() : null,
      color: resolveTagColor(runs, token),
    };
  });

  const title = remainder
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    povName: povName && povName.length > 0 ? povName : null,
    title: title.length > 0 ? title : remainder.trim(),
    tags,
  };
};

const ACT_HEADING_SIZE = 2;
const CHAPTER_HEADING_SIZE = 3;
const SCENE_HEADING_SIZE = 4;

export const parseImportOutlineDocx = async (
  fileBuffer: Buffer,
): Promise<ImportParseResult> => {
  const ast = (await parseOffice(fileBuffer, {
    includeRawContent: true,
  })) as OfficeParserAST;

  if (!ast || !Array.isArray(ast.content)) {
    return createEmptyResult();
  }

  const result = createEmptyResult();
  const tagMap = new Map<string, Tag>();
  const characterMap = new Map<string, Character>();
  let actIndex = 0;
  let chapterIndex = 0;
  let sceneIndex = 0;

  let currentAct: ActElement | null = null;
  let currentChapter: ChapterElement | null = null;
  let currentScene: SceneElement | null = null;
  let currentSnippet: Snippet | null = null;
  let currentSnippetIndent = 0;
  let snippetOrder = 0;

  const resetSnippet = () => {
    currentSnippet = null;
    currentSnippetIndent = 0;
  };

  for (const node of ast.content) {
    const headingLevel = getHeadingLevel(node);

    if (headingLevel === ACT_HEADING_SIZE) {
      actIndex += 1;
      const act: ActElement = {
        id: `act_${actIndex}`,
        type: "act",
        title: getHeadingText(node) || `Act ${actIndex}`,
        content: [],
      };
      result.elements.push(act);
      currentAct = act;
      currentChapter = null;
      currentScene = null;
      resetSnippet();
      continue;
    }

    if (headingLevel === CHAPTER_HEADING_SIZE) {
      chapterIndex += 1;
      if (!currentAct) {
        addIssue(
          result.issues,
          "error",
          "Chapter appears before any act heading.",
          getHeadingText(node),
        );
      }
      const chapter: ChapterElement = {
        id: `chapter_${chapterIndex}`,
        type: "chapter",
        title: getHeadingText(node) || `Chapter ${chapterIndex}`,
        actId: currentAct?.id ?? "",
      };
      result.elements.push(chapter);
      currentChapter = chapter;
      currentScene = null;
      resetSnippet();
      continue;
    }

    if (headingLevel === SCENE_HEADING_SIZE) {
      sceneIndex += 1;
      const parsedHeading = parseSceneHeading(node);
      const sceneTitle = parsedHeading.title || `Scene ${sceneIndex}`;

      let povCharacterId: string | null = null;
      const sceneCharacterIds: string[] = [];

      if (parsedHeading.povName) {
        const characterKey = buildCharacterKey(parsedHeading.povName);
        const existing = characterMap.get(characterKey) ?? null;

        if (!existing) {
          const character: Character = {
            id: `character_${characterMap.size + 1}`,
            name: parsedHeading.povName,
          };
          characterMap.set(characterKey, character);
          result.characters.push(character);
          povCharacterId = character.id;
        } else {
          povCharacterId = existing.id;
        }

        if (povCharacterId) {
          sceneCharacterIds.push(povCharacterId);
        }
      }

      const sceneTagIds: string[] = [];
      for (const tagEntry of parsedHeading.tags) {
        if (!tagEntry.name) {
          continue;
        }

        const tagKey = buildTagKey(tagEntry.name, tagEntry.variant);
        const existing = tagMap.get(tagKey);
        if (existing) {
          sceneTagIds.push(existing.id);
          continue;
        }

        const tag: Tag = {
          id: `tag_${tagMap.size + 1}`,
          name: tagEntry.name,
          variant: tagEntry.variant,
          color: tagEntry.color,
        };
        tagMap.set(tagKey, tag);
        result.tags.push(tag);
        sceneTagIds.push(tag.id);
      }

      const scene: SceneElement = {
        id: `scene_${sceneIndex}`,
        type: "scene",
        title: sceneTitle,
        chapterId: currentChapter?.id ?? "",
        povCharacterId,
        tagIds: sceneTagIds,
        characterIds: sceneCharacterIds,
        snippets: [],
        content: [],
      };
      result.elements.push(scene);
      currentScene = scene;
      resetSnippet();
      snippetOrder = 0;
      continue;
    }

    if (node.type !== "paragraph") {
      continue;
    }

    const html = renderNodeToHtml(node);
    if (!html) {
      continue;
    }

    if (currentScene) {
      const indentTwips = getParagraphIndentTwips(node);
      const isSnippet = indentTwips >= snippetIndentThresholdTwips;

      if (isSnippet) {
        const sameIndent =
          currentSnippet && Math.abs(indentTwips - currentSnippetIndent) <= 120;

        if (!sameIndent) {
          currentSnippet = {
            id: `${currentScene.id}_snippet_${snippetOrder}`,
            order: snippetOrder,
            content: [],
          };
          snippetOrder += 1;
          currentSnippetIndent = indentTwips;
          currentScene.snippets.push(currentSnippet);
        }

        currentSnippet?.content.push(html);
        continue;
      }

      resetSnippet();
      currentScene.content.push(html);
      continue;
    }

    if (currentAct) {
      resetSnippet();
      currentAct.content.push(html);
    }
  }

  return result;
};
