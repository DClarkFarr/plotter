import { parseOffice } from "officeparser";
import type {
  HeadingMetadata,
  OfficeContentNode,
  OfficeParserAST,
} from "officeparser";
import {
  groupAstElements,
  isListNode,
  renderNodeToHtml,
} from "../utils/docxHtml";
import {
  buildCharacterKey,
  buildTagKey,
  canonicalizeDisplayName,
  canonicalizeTag,
} from "../utils/importNormalization";
import type {
  ActElement,
  ChapterElement,
  ImportIssue,
  ImportParseResult,
  Tag,
  Character,
  SceneElement,
  Snippet,
  Element,
  ElementType,
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

  const match = node.rawContent.match(/w:ind\b[^>]*\bw:left=['"](\d+)['"]/i);
  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : 0;
};

const getNodeIndentTwips = (node: OfficeContentNode): number => {
  const directIndent = getParagraphIndentTwips(node);
  if (directIndent > 0) {
    return directIndent;
  }

  if (!node.children || node.children.length === 0) {
    return 0;
  }

  return Math.max(
    ...node.children.map((child) => getNodeIndentTwips(child)),
    0,
  );
};

const createEmptyResult = (): ImportParseResult => ({
  elements: [],
  tags: [],
  plots: [],
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

  // Match POV only if the heading starts with plain text (no brackets or colons) followed by a colon.
  // This prevents matching colons inside [tag:variant] tokens.
  const povMatch = headingText.match(/^([^[\]:]+):\s*(.*)/s);
  const povName = povMatch ? povMatch[1]?.trim() : null;
  let remainder = povMatch ? povMatch[2] || "" : headingText;

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

  // Remove each matched tag token from the remainder to produce the title.
  let title = remainder;
  for (const match of tagMatches) {
    title = title.replace(match[0], " ");
  }
  title = title.replace(/\s+/g, " ").trim();

  return {
    povName: povName && povName.length > 0 ? povName : null,
    title,
    tags,
  };
};

const ACT_HEADING_SIZE = 2;
const CHAPTER_HEADING_SIZE = 3;
const SCENE_HEADING_SIZE = 4;

export const parseImportOutlineLegacyDocx = async (
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

  let currentElement: Element | null = null;
  let currentSnippet: Snippet | null = null;
  let currentSnippetIndent = 0;
  let snippetOrder = 0;

  const resetSnippet = () => {
    if (currentSnippet) {
      // get last snippet;
      let saved = false;
      for (let i = result.elements.length - 1; i--; ) {
        const element = result.elements[i];
        if (element && isElementType(element, "scene")) {
          element.snippets.push(currentSnippet);
          saved = true;
          break;
        } else {
          addIssue(
            result.issues,
            "warning",
            `Could not save snippet to element type ${element?.type || "null"}`,
            "resetSnippet",
          );
        }
      }
      if (!saved) {
        addIssue(
          result.issues,
          "warning",
          `Could not save snippet. Elements length was: ${result.elements.length}`,
          "resetSnippet",
        );
      }
    }

    currentSnippet = null;
    currentSnippetIndent = 0;
    snippetOrder = 0;
  };

  const content = groupAstElements(ast.content);
  for (const node of content) {
    const headingLevel = getHeadingLevel(node);

    if (headingLevel === ACT_HEADING_SIZE) {
      actIndex += 1;
      const act: ActElement = {
        id: `act_${actIndex}`,
        type: "act",
        title: getHeadingText(node) || `Act ${actIndex}`,
        content: [],
      };

      resetSnippet();
      result.elements.push(act);
      currentElement = act;
      continue;
    }

    if (headingLevel === CHAPTER_HEADING_SIZE) {
      chapterIndex += 1;
      const chapter: ChapterElement = {
        id: `chapter_${chapterIndex}`,
        type: "chapter",
        title: getHeadingText(node) || `Chapter ${chapterIndex}`,
        content: [],
      };

      resetSnippet();
      result.elements.push(chapter);
      currentElement = chapter;
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
          const canonicalName = canonicalizeDisplayName(parsedHeading.povName);
          const character: Character = {
            id: `character_${characterMap.size + 1}`,
            name: canonicalName || parsedHeading.povName.trim(),
            rawVariants: [parsedHeading.povName],
          };
          characterMap.set(characterKey, character);
          result.characters.push(character);
          povCharacterId = character.id;
        } else {
          const variants = existing.rawVariants ?? [];
          if (!variants.includes(parsedHeading.povName)) {
            variants.push(parsedHeading.povName);
            existing.rawVariants = variants;
          }
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
        let tag = tagMap.get(tagKey);
        const rawToken = tagEntry.variant
          ? `${tagEntry.name}:${tagEntry.variant}`
          : tagEntry.name;
        if (!tag) {
          const canonical = canonicalizeTag(tagEntry.name, tagEntry.variant);
          tag = {
            id: `tag_${tagMap.size + 1}`,
            name: canonical.name || tagEntry.name.trim(),
            variant: canonical.variant,
            color: tagEntry.color,
            rawVariants: [rawToken],
          };
          tagMap.set(tagKey, tag);
          result.tags.push(tag);
        } else {
          const variants = tag.rawVariants ?? [];
          if (!variants.includes(rawToken)) {
            variants.push(rawToken);
            tag.rawVariants = variants;
          }
        }

        sceneTagIds.push(tag.id);
      }

      const scene: SceneElement = {
        id: `scene_${sceneIndex}`,
        type: "scene",
        title: sceneTitle,
        povCharacterId,
        tagIds: sceneTagIds,
        plotIds: [],
        characterIds: sceneCharacterIds,
        snippets: [],
        content: [],
      };

      resetSnippet();
      result.elements.push(scene);
      currentElement = scene;
      continue;
    }

    if (node.type !== "paragraph" && !isListNode(node)) {
      addIssue(
        result.issues,
        "warning",
        `Unsupported content type "${node.type}" will be ignored.`,
        node.text,
      );
      continue;
    }

    const html = renderNodeToHtml(node);
    if (!html) {
      continue;
    }

    if (isElementType(currentElement, "scene")) {
      const indentTwips = getNodeIndentTwips(node);
      const isSnippet = indentTwips >= snippetIndentThresholdTwips;

      if (isSnippet) {
        const sameIndent =
          currentSnippet && Math.abs(indentTwips - currentSnippetIndent) <= 120;

        if (!sameIndent) {
          currentSnippet = {
            id: `${currentElement.id}_snippet_${snippetOrder}`,
            order: snippetOrder,
            label: `Snippet ${snippetOrder + 1}`,
            content: [],
          };
          snippetOrder += 1;
          currentSnippetIndent = indentTwips;
          currentElement.snippets.push(currentSnippet);
        }

        currentSnippet?.content.push(html);
        continue;
      } else if (currentSnippet) {
        resetSnippet();
      }
    }

    if (currentElement) {
      currentElement.content.push(html);
    } else {
      addIssue(
        result.issues,
        "warning",
        `No current element, html may have been lost.`,
        html,
      );
    }
  }

  return result;
};

type ElementMap = {
  act: ActElement;
  chapter: ChapterElement;
  scene: SceneElement;
};
type ElementTypeToElement<T extends ElementType> = ElementMap[T];

export const isElementType = <T extends ElementType>(
  element: Element | null,
  type: T,
): element is ElementTypeToElement<T> => {
  if (!element) {
    return false;
  }
  return element.type === type;
};
