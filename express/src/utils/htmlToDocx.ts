import {
  Document,
  HeadingLevel,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  type IRunOptions,
  type IParagraphOptions,
} from "docx";
import { parse, HTMLElement, TextNode } from "node-html-parser";

// Re-export Document for use in the service
export { Document, Paragraph, TextRun, HeadingLevel };

export const SNIPPET_LEFT_INDENT_TWIPS = 720;
const PARAGRAPH_MARGIN_BOTTOM_TWIPS = 120;

// ── Contrast color ────────────────────────────────────────────────────────────

/**
 * Returns a readable foreground hex for a given background hex color.
 * Strips a leading "#" if present. Falls back to black on any parse error.
 */
export const contrastColor = (hexColor: string): string => {
  const hex = hexColor.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "000000";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "000000" : "FFFFFF";
};

// ── Inline formatting state ───────────────────────────────────────────────────

interface InlineStyle {
  bold?: true;
  italics?: true;
  underline?: true;
  strike?: true;
  color?: string;
  size?: number; // half-points
  font?: string;
}

// ── Build a TextRun respecting exactOptionalPropertyTypes ────────────────────

const makeTextRun = (
  text: string,
  style: InlineStyle,
  fontOverride?: string,
): TextRun => {
  const font = fontOverride ?? style.font;
  return new TextRun({
    text,
    ...(style.bold ? { bold: true } : {}),
    ...(style.italics ? { italics: true } : {}),
    ...(style.underline ? { underline: { type: UnderlineType.SINGLE } } : {}),
    ...(style.strike ? { strike: true } : {}),
    ...(style.color ? { color: style.color } : {}),
    ...(style.size ? { size: style.size } : {}),
    ...(font ? { font } : {}),
  });
};

// ── HTML → docx conversion ────────────────────────────────────────────────────

/**
 * Parse inline CSS style string into partial InlineStyle fields.
 */
const parseStyleAttr = (style: string): Partial<InlineStyle> => {
  const result: Partial<InlineStyle> = {};
  for (const decl of style.split(";")) {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim();
    const val = decl.slice(colonIdx + 1).trim();
    if (!prop || !val) continue;
    if (prop === "font-weight" && (val === "bold" || parseInt(val) >= 700)) {
      result.bold = true;
    } else if (prop === "font-style" && val === "italic") {
      result.italics = true;
    } else if (prop === "text-decoration" && val.includes("underline")) {
      result.underline = true;
    } else if (prop === "color") {
      const hex = val.replace(/^#/, "");
      if (/^[0-9a-fA-F]{6}$/.test(hex)) result.color = hex;
    } else if (prop === "font-size") {
      const px = parseFloat(val);
      if (!isNaN(px)) result.size = Math.round(px * 1.5); // px → half-points (approx)
    } else if (prop === "font-family") {
      result.font = (val.replace(/["']/g, "").split(",")[0] ?? "").trim();
    }
  }
  return result;
};

/**
 * Collect text runs from an HTML node tree into the provided array.
 */
const collectRuns = (
  node: HTMLElement | TextNode,
  inherited: InlineStyle,
  runs: TextRun[],
  fontOverride?: string,
): void => {
  if (node instanceof TextNode) {
    const text = node.rawText ?? "";
    if (!text) return;
    runs.push(makeTextRun(text, inherited, fontOverride));
    return;
  }

  const tag = node.tagName?.toLowerCase() ?? "";
  const style: InlineStyle = { ...inherited };

  if (tag === "strong" || tag === "b") style.bold = true;
  if (tag === "em" || tag === "i") style.italics = true;
  if (tag === "u") style.underline = true;
  if (tag === "s" || tag === "del" || tag === "strike") style.strike = true;
  if (tag === "span") {
    const styleAttr = node.getAttribute("style") ?? "";
    if (styleAttr) Object.assign(style, parseStyleAttr(styleAttr));
  }
  if (tag === "br") {
    const opts: IRunOptions = { text: "", break: 1 };
    runs.push(new TextRun(opts));
    return;
  }

  for (const child of node.childNodes) {
    collectRuns(child as HTMLElement | TextNode, style, runs, fontOverride);
  }
};

/**
 * Convert a single block-level element to a Paragraph.
 */
const blockToParagraph = (
  node: HTMLElement,
  inherited: InlineStyle,
  listLevel: number,
  listRef: "bullet" | "ordered" | undefined,
  fontOverride?: string,
  isSnippet?: boolean,
): Paragraph => {
  const runs: TextRun[] = [];
  for (const child of node.childNodes) {
    collectRuns(child as HTMLElement | TextNode, inherited, runs, fontOverride);
  }

  return new Paragraph({
    indent: isSnippet
      ? {
          left:
            500 +
            SNIPPET_LEFT_INDENT_TWIPS +
            SNIPPET_LEFT_INDENT_TWIPS * listLevel,
        }
      : {},
    // Add breathing room between prose paragraphs but keep list rows tight.
    ...(listRef === undefined
      ? { spacing: { after: PARAGRAPH_MARGIN_BOTTOM_TWIPS } }
      : {}),
    children: runs,
    ...(listRef !== undefined
      ? { numbering: { reference: listRef, level: listLevel } }
      : {}),
  });
};

/**
 * Recursively convert an HTML element subtree to Paragraphs.
 */
const nodesToParagraphs = (
  nodes: (HTMLElement | TextNode)[],
  inherited: InlineStyle,
  listDepth: number,
  listRef: "bullet" | "ordered" | undefined,
  paragraphs: Paragraph[],
  fontOverride?: string,
  isSnippet?: boolean,
): void => {
  for (const node of nodes) {
    if (node instanceof TextNode) {
      const text = node.rawText.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            indent: isSnippet ? { left: SNIPPET_LEFT_INDENT_TWIPS } : {},
            children: [makeTextRun(text, inherited)],
          }),
        );
      }
      continue;
    }

    const tag = node.tagName?.toLowerCase() ?? "";

    if (tag === "p") {
      paragraphs.push(
        blockToParagraph(
          node,
          inherited,
          listDepth,
          undefined,
          fontOverride,
          isSnippet,
        ),
      );
    } else if (tag === "ul" || tag === "ol") {
      const ref: "bullet" | "ordered" = tag === "ul" ? "bullet" : "ordered";
      nodesToParagraphs(
        node.childNodes as (HTMLElement | TextNode)[],
        inherited,
        listDepth,
        ref,
        paragraphs,
        fontOverride,
        isSnippet,
      );
    } else if (tag === "li") {
      const inlineNodes: (HTMLElement | TextNode)[] = [];
      const nestedLists: HTMLElement[] = [];
      for (const child of node.childNodes) {
        const childEl = child as HTMLElement;
        const childTag = childEl.tagName?.toLowerCase();
        if (childTag === "ul" || childTag === "ol") {
          nestedLists.push(childEl);
        } else {
          inlineNodes.push(child as HTMLElement | TextNode);
        }
      }

      const fakeNode = {
        ...node,
        childNodes: inlineNodes,
      } as unknown as HTMLElement;
      paragraphs.push(
        blockToParagraph(
          fakeNode,
          inherited,
          listDepth,
          listRef,
          fontOverride,
          isSnippet,
        ),
      );

      for (const nested of nestedLists) {
        const nestedRef: "bullet" | "ordered" =
          nested.tagName?.toLowerCase() === "ul" ? "bullet" : "ordered";
        nodesToParagraphs(
          nested.childNodes as (HTMLElement | TextNode)[],
          inherited,
          listDepth + 1,
          nestedRef,
          paragraphs,
          fontOverride,
          isSnippet,
        );
      }
    } else if (/^h[1-6]$/.test(tag)) {
      const levelNum = parseInt(tag.charAt(1));
      const levelMap: Record<
        number,
        (typeof HeadingLevel)[keyof typeof HeadingLevel]
      > = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };
      const heading = levelMap[levelNum] ?? HeadingLevel.HEADING_1;
      const runs: TextRun[] = [];
      for (const child of node.childNodes) {
        collectRuns(child as HTMLElement | TextNode, inherited, runs);
      }
      paragraphs.push(
        new Paragraph({
          heading,
          children: runs,
          indent: isSnippet ? { left: SNIPPET_LEFT_INDENT_TWIPS } : {},
        }),
      );
    } else {
      nodesToParagraphs(
        node.childNodes as (HTMLElement | TextNode)[],
        inherited,
        listDepth,
        listRef,
        paragraphs,
        fontOverride,
        isSnippet,
      );
    }
  }
};

/**
 * Convert a Tiptap-generated HTML string into an array of docx Paragraphs.
 *
 * - Handles p, strong, em, u, s, br, ul, ol, li, h1–h6, span[style]
 * - Unknown elements fall back to their text content
 * - null/empty input returns a single empty Paragraph
 * - fontOverride applies a font family to all text runs (used for snippets)
 */
export const htmlToDocxParagraphs = (
  html: string | null | undefined,
  fontOverride?: string,
  isSnippet?: boolean,
): Paragraph[] => {
  if (!html || !html.trim()) {
    return [new Paragraph("")];
  }

  const root = parse(html);
  const paragraphs: Paragraph[] = [];
  nodesToParagraphs(
    root.childNodes as (HTMLElement | TextNode)[],
    {},
    0,
    undefined,
    paragraphs,
    fontOverride,
    isSnippet,
  );

  return paragraphs.length > 0 ? paragraphs : [new Paragraph("")];
};

// ── Numbering definitions for bullet and ordered lists ───────────────────────

export const NUMBERING_CONFIG = {
  config: [
    {
      reference: "bullet",
      levels: Array.from({ length: 9 }, (_, i) => ({
        level: i,
        format: "bullet" as const,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: {
            indent: { left: 720 * (i + 1), hanging: 360 },
          },
        },
      })),
    },
    {
      reference: "ordered",
      levels: Array.from({ length: 9 }, (_, i) => ({
        level: i,
        format: "decimal" as const,
        text: `%${i + 1}.`,
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: {
            indent: { left: 720 * (i + 1), hanging: 360 },
          },
        },
      })),
    },
  ],
};
