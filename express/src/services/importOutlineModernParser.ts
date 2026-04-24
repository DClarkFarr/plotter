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
import { buildCharacterKey, buildTagKey } from "../utils/importNormalization";
import type {
  ActElement,
  ChapterElement,
  Character,
  Element,
  ElementType,
  ImportIssue,
  ImportPlot,
  ImportParseResult,
  SceneElement,
  Snippet,
  Tag,
} from "../types/importOutline";

const snippetIndentThresholdTwips = 600;
const ACT_HEADING_SIZE = 1;
const CHAPTER_HEADING_SIZE = 2;
const SCENE_HEADING_SIZE = 3;
const PLOT_HEADING_SIZE = 4;
const SNIPPET_HEADING_SIZE = 5;

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

const getHeadingLevel = (node: OfficeContentNode): number | null => {
  if (node.type !== "heading") {
    return null;
  }

  const metadata = node.metadata as HeadingMetadata | undefined;
  return typeof metadata?.level === "number" ? metadata.level : null;
};

const getHeadingText = (node: OfficeContentNode): string =>
  (node.text ?? "").trim();

const getIndentAttributeTwips = (
  rawContent: string,
  attributeName: "left" | "start" | "firstLine" | "hanging",
): number => {
  const match = rawContent.match(
    new RegExp(`w:ind\\b[^>]*\\bw:${attributeName}=['\"](\\d+)['\"]`, "i"),
  );

  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : 0;
};

const getParagraphIndentTwips = (node: OfficeContentNode): number => {
  if (!node.rawContent) {
    return 0;
  }

  // Word may serialize paragraph indentation as left/start or as first-line/hanging.
  const leftIndent = getIndentAttributeTwips(node.rawContent, "left");
  const startIndent = getIndentAttributeTwips(node.rawContent, "start");
  const firstLineIndent = getIndentAttributeTwips(node.rawContent, "firstLine");
  const hangingIndent = getIndentAttributeTwips(node.rawContent, "hanging");

  return Math.max(leftIndent, startIndent, firstLineIndent, hangingIndent, 0);
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

const resolveTokenColor = (runs: TextRun[], token: string): string | null => {
  for (const run of runs) {
    if (!run.text.includes(token)) {
      continue;
    }
    return run.formatting?.backgroundColor ?? run.formatting?.color ?? null;
  }
  return null;
};

const ensureTag = (
  result: ImportParseResult,
  tagMap: Map<string, Tag>,
  name: string,
  variant: string | null,
  color: string | null,
): Tag => {
  const tagKey = buildTagKey(name, variant);
  const existing = tagMap.get(tagKey);
  if (existing) {
    return existing;
  }

  const created: Tag = {
    id: `tag_${tagMap.size + 1}`,
    name,
    variant,
    color,
  };
  tagMap.set(tagKey, created);
  result.tags.push(created);
  return created;
};

const ensurePlot = (
  result: ImportParseResult,
  plotMap: Map<string, ImportPlot>,
  name: string,
  color: string | null,
): ImportPlot => {
  const plotKey = buildTagKey(name, null);
  const existing = plotMap.get(plotKey);
  if (existing) {
    return existing;
  }

  const created: ImportPlot = {
    id: `plot_${plotMap.size + 1}`,
    name,
    color,
  };
  plotMap.set(plotKey, created);
  result.plots.push(created);
  return created;
};

const getNodeText = (node: OfficeContentNode): string =>
  collectTextRuns(node)
    .map((run) => run.text)
    .join("")
    .trim();

type ParsedSceneHeading = {
  povName: string | null;
  title: string;
};

const parseSceneHeading = (node: OfficeContentNode): ParsedSceneHeading => {
  const headingText = getHeadingText(node);
  const povMatch = headingText.match(/^([^[\]:]+):\s*(.*)/s);
  const povName = povMatch ? povMatch[1]?.trim() : null;
  const title = (povMatch ? povMatch[2] : headingText)?.trim() || "";

  return {
    povName: povName && povName.length > 0 ? povName : null,
    title,
  };
};

const parseBracketTags = (
  node: OfficeContentNode,
): Array<{ name: string; variant: string | null; color: string | null }> => {
  const text = getNodeText(node);
  const runs = collectTextRuns(node);
  const matches = [...text.matchAll(/\[[^\]]+\]/g)];

  return matches
    .map((match) => {
      const token = match[0];
      const raw = token.slice(1, -1).trim();
      const [nameRaw, variantRaw] = raw.split(":");
      const name = (nameRaw ?? "").trim();
      return {
        name,
        variant: variantRaw ? variantRaw.trim() : null,
        color: resolveTokenColor(runs, token),
      };
    })
    .filter((entry) => entry.name.length > 0);
};

type ElementMap = {
  act: ActElement;
  chapter: ChapterElement;
  scene: SceneElement;
};
type ElementTypeToElement<T extends ElementType> = ElementMap[T];

const isElementType = <T extends ElementType>(
  element: Element | null,
  type: T,
): element is ElementTypeToElement<T> => {
  if (!element) {
    return false;
  }
  return element.type === type;
};

export const parseImportOutlineModernDocx = async (
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
  const plotMap = new Map<string, ImportPlot>();
  const characterMap = new Map<string, Character>();

  let actIndex = 0;
  let chapterIndex = 0;
  let sceneIndex = 0;
  let snippetOrder = 0;

  let currentElement: Element | null = null;
  let currentSnippet: Snippet | null = null;
  let pendingPlotId: string | null = null;
  let expectingTagRowForScene = false;
  let pendingSnippetHeading: string | null = null;

  const finishCurrentSnippet = () => {
    currentSnippet = null;
  };

  const content = groupAstElements(ast.content);
  for (const node of content) {
    const headingLevel = getHeadingLevel(node);

    if (headingLevel === ACT_HEADING_SIZE) {
      finishCurrentSnippet();
      pendingSnippetHeading = null;
      expectingTagRowForScene = false;

      actIndex += 1;
      const act: ActElement = {
        id: `act_${actIndex}`,
        type: "act",
        title: getHeadingText(node) || `Act ${actIndex}`,
        content: [],
      };
      result.elements.push(act);
      currentElement = act;
      continue;
    }

    if (headingLevel === CHAPTER_HEADING_SIZE) {
      finishCurrentSnippet();
      pendingSnippetHeading = null;
      expectingTagRowForScene = false;

      chapterIndex += 1;
      const chapter: ChapterElement = {
        id: `chapter_${chapterIndex}`,
        type: "chapter",
        title: getHeadingText(node) || `Chapter ${chapterIndex}`,
        content: [],
      };
      result.elements.push(chapter);
      currentElement = chapter;
      continue;
    }

    const headingText = getHeadingText(node);

    if (headingLevel === PLOT_HEADING_SIZE || headingText.startsWith("|")) {
      finishCurrentSnippet();
      pendingSnippetHeading = null;
      expectingTagRowForScene = false;

      const plotTitle = headingText
        .replace(/^\|+\s*/, "")
        .replace(/:\s*$/, "")
        .trim();

      if (!plotTitle) {
        pendingPlotId = null;
        addIssue(
          result.issues,
          "warning",
          "Modern plot heading is missing a plot title.",
          headingText,
        );
        continue;
      }

      const plotColor = resolveTokenColor(collectTextRuns(node), "|");
      const plot = ensurePlot(result, plotMap, plotTitle, plotColor);

      if (pendingPlotId) {
        addIssue(
          result.issues,
          "warning",
          "Detected consecutive plot headings before a scene; using the latest one.",
          headingText,
        );
      }
      pendingPlotId = plot.id;
      continue;
    }

    if (headingLevel === SCENE_HEADING_SIZE) {
      finishCurrentSnippet();
      pendingSnippetHeading = null;

      sceneIndex += 1;
      const parsedHeading = parseSceneHeading(node);
      const sceneTitle = parsedHeading.title || `Scene ${sceneIndex}`;

      let povCharacterId: string | null = null;
      const sceneCharacterIds: string[] = [];

      if (parsedHeading.povName) {
        const characterKey = buildCharacterKey(parsedHeading.povName);
        const existing = characterMap.get(characterKey) ?? null;
        if (!existing) {
          const created: Character = {
            id: `character_${characterMap.size + 1}`,
            name: parsedHeading.povName,
          };
          characterMap.set(characterKey, created);
          result.characters.push(created);
          povCharacterId = created.id;
        } else {
          povCharacterId = existing.id;
        }
      }

      if (povCharacterId) {
        sceneCharacterIds.push(povCharacterId);
      }

      const scenePlotIds: string[] = [];
      if (pendingPlotId) {
        scenePlotIds.push(pendingPlotId);
        pendingPlotId = null;
      } else {
        addIssue(
          result.issues,
          "warning",
          "Scene heading is not preceded by a modern plot heading.",
          sceneTitle,
        );
      }

      const scene: SceneElement = {
        id: `scene_${sceneIndex}`,
        type: "scene",
        title: sceneTitle,
        povCharacterId,
        tagIds: [],
        plotIds: scenePlotIds,
        characterIds: sceneCharacterIds,
        snippets: [],
        content: [],
      };
      result.elements.push(scene);
      currentElement = scene;
      expectingTagRowForScene = true;
      continue;
    }

    if (headingLevel === SNIPPET_HEADING_SIZE) {
      if (!isElementType(currentElement, "scene")) {
        addIssue(
          result.issues,
          "warning",
          "Snippet heading found outside a scene; ignored.",
          getHeadingText(node),
        );
        continue;
      }

      finishCurrentSnippet();
      const snippetHeadingText = getHeadingText(node);
      if (!snippetHeadingText.endsWith(":")) {
        pendingSnippetHeading = null;
        addIssue(
          result.issues,
          "warning",
          "Snippet heading must end with ':' in modern format.",
          snippetHeadingText,
        );
        continue;
      }

      pendingSnippetHeading = snippetHeadingText;
      continue;
    }

    if (!isElementType(currentElement, "scene") && node.type === "paragraph") {
      const rawNodeText = getNodeText(node);
      if (rawNodeText.startsWith("|")) {
        const plotTitle = rawNodeText
          .replace(/^\|+\s*/, "")
          .replace(/:\s*$/, "")
          .trim();

        if (!plotTitle) {
          pendingPlotId = null;
          addIssue(
            result.issues,
            "warning",
            "Modern plot heading is missing a plot title.",
            rawNodeText,
          );
          continue;
        }

        const plotColor = resolveTokenColor(collectTextRuns(node), "|");
        const plot = ensurePlot(result, plotMap, plotTitle, plotColor);
        pendingPlotId = plot.id;
        expectingTagRowForScene = false;
        pendingSnippetHeading = null;
        finishCurrentSnippet();
        continue;
      }
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

    if (isElementType(currentElement, "scene") && expectingTagRowForScene) {
      const tags = parseBracketTags(node);
      if (tags.length > 0) {
        for (const tagEntry of tags) {
          const tag = ensureTag(
            result,
            tagMap,
            tagEntry.name,
            tagEntry.variant,
            tagEntry.color,
          );
          if (!currentElement.tagIds.includes(tag.id)) {
            currentElement.tagIds.push(tag.id);
          }
        }
        expectingTagRowForScene = false;
        continue;
      }

      const rawText = getNodeText(node);
      if (rawText.length === 0) {
        continue;
      }

      expectingTagRowForScene = false;
    }

    const html = renderNodeToHtml(node);
    if (!html) {
      continue;
    }

    if (isElementType(currentElement, "scene")) {
      const indentTwips = getNodeIndentTwips(node);
      const isSnippetBlock = indentTwips >= snippetIndentThresholdTwips;

      if (isSnippetBlock) {
        if (!pendingSnippetHeading) {
          addIssue(
            result.issues,
            "warning",
            "Indented snippet content found without a preceding H5 snippet heading; treating as scene content.",
            currentElement.id,
          );
          currentElement.content.push(html);
          continue;
        }

        if (!currentSnippet) {
          currentSnippet = {
            id: `${currentElement.id}_snippet_${snippetOrder}`,
            order: snippetOrder,
            content: [],
          };
          snippetOrder += 1;
          currentElement.snippets.push(currentSnippet);
        }

        currentSnippet.content.push(html);
        continue;
      }

      if (pendingSnippetHeading && !currentSnippet) {
        addIssue(
          result.issues,
          "warning",
          "Snippet heading was not followed by an indented snippet block.",
          pendingSnippetHeading,
        );
      }

      pendingSnippetHeading = null;
      finishCurrentSnippet();
      currentElement.content.push(html);
      continue;
    }

    if (pendingSnippetHeading && !currentSnippet) {
      addIssue(
        result.issues,
        "warning",
        "Snippet heading was not followed by an indented snippet block.",
        pendingSnippetHeading,
      );
      pendingSnippetHeading = null;
    }

    if (currentElement) {
      currentElement.content.push(html);
    } else {
      addIssue(
        result.issues,
        "warning",
        "No current element, html may have been lost.",
        html,
      );
    }
  }

  return result;
};
