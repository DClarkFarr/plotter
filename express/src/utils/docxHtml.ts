import type { OfficeContentNode, TextFormatting } from "officeparser";

type StylePart = { key: string; value: string };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formattingToStyle = (formatting?: TextFormatting): string => {
  if (!formatting) {
    return "";
  }

  const styles: StylePart[] = [];

  if (formatting.bold) {
    styles.push({ key: "font-weight", value: "700" });
  }

  if (formatting.italic) {
    styles.push({ key: "font-style", value: "italic" });
  }

  if (formatting.underline) {
    styles.push({ key: "text-decoration", value: "underline" });
  }

  if (formatting.strikethrough) {
    styles.push({ key: "text-decoration", value: "line-through" });
  }

  if (formatting.color) {
    styles.push({ key: "color", value: formatting.color });
  }

  if (formatting.backgroundColor) {
    styles.push({ key: "background-color", value: formatting.backgroundColor });
  }

  if (formatting.font) {
    styles.push({ key: "font-family", value: formatting.font });
  }

  if (formatting.size) {
    styles.push({ key: "font-size", value: formatting.size });
  }

  if (formatting.subscript) {
    styles.push({ key: "vertical-align", value: "sub" });
    styles.push({ key: "font-size", value: "smaller" });
  }

  if (formatting.superscript) {
    styles.push({ key: "vertical-align", value: "super" });
    styles.push({ key: "font-size", value: "smaller" });
  }

  return styles.map((style) => `${style.key}: ${style.value}`).join("; ");
};

const renderTextNode = (node: OfficeContentNode): string => {
  const text = node.text ?? "";
  const content = escapeHtml(text);
  const style = formattingToStyle(node.formatting);

  if (!style) {
    return content;
  }

  return `<span style=\"${style}\">${content}</span>`;
};

const renderInlineNodes = (nodes: OfficeContentNode[] = []): string =>
  nodes.map((node) => renderInlineNode(node)).join("");

const renderInlineNode = (node: OfficeContentNode): string => {
  if (node.type === "text") {
    return renderTextNode(node);
  }

  if (node.children && node.children.length > 0) {
    return renderInlineNodes(node.children);
  }

  if (node.text) {
    return escapeHtml(node.text);
  }

  return "";
};

const listContainerTypes = new Set(["list"]);
const listItemTypes = new Set([
  "listItem",
  "list-item",
  "list_item",
  "listitem",
]);

const isListContainerNode = (node: OfficeContentNode): boolean =>
  listContainerTypes.has(node.type);

const isListItemNode = (node: OfficeContentNode): boolean =>
  listItemTypes.has(node.type);

const resolveListContainerType = (node: OfficeContentNode): "ul" | "ol" => {
  const metadata = node.metadata as
    | { listType?: string; ordered?: boolean; type?: string; numFmt?: string }
    | undefined;
  const listTypeRaw = metadata?.listType ?? metadata?.type ?? metadata?.numFmt;

  if (typeof listTypeRaw === "string") {
    const normalized = listTypeRaw.toLowerCase();
    if (["ordered", "number", "decimal", "ol"].includes(normalized)) {
      return "ol";
    }
    if (["bullet", "unordered", "ul"].includes(normalized)) {
      return "ul";
    }
  }

  if (metadata?.ordered === true) {
    return "ol";
  }

  return "ul";
};

const renderListItemContent = (node: OfficeContentNode): string => {
  if (node.children && node.children.length > 0) {
    return node.children
      .map((child) => {
        if (isListContainerNode(child)) {
          return renderList(child);
        }

        return renderInlineNode(child);
      })
      .filter(Boolean)
      .join("");
  }

  if (node.text) {
    return escapeHtml(node.text);
  }

  return "";
};

const renderListItem = (node: OfficeContentNode): string => {
  const content = renderListItemContent(node);

  if (!content) {
    return "";
  }

  return `<li>${content}</li>`;
};

const renderListFromItems = (
  items: OfficeContentNode[],
  listType: "ul" | "ol",
): string => {
  const listItems = items.map((item) => renderListItem(item)).filter(Boolean);

  if (listItems.length === 0) {
    return "";
  }

  return `<${listType}>${listItems.join("")}</${listType}>`;
};

const renderList = (node: OfficeContentNode): string => {
  const listType = resolveListContainerType(node);
  const children = node.children ?? [];
  const explicitItems = children.filter((child) => isListItemNode(child));
  const items = explicitItems.length > 0 ? explicitItems : children;

  console.log("got list type", listType, "and items", items, "from node", node);

  if (items.length === 0) {
    return renderListFromItems([node], listType);
  }

  return renderListFromItems(items, listType);
};

export const renderNodeToHtml = (node: OfficeContentNode): string => {
  if (isListContainerNode(node)) {
    return renderList(node);
  }

  if (isListItemNode(node)) {
    return renderListFromItems([node], resolveListContainerType(node));
  }

  const content = renderInlineNode(node);

  if (!content) {
    return "";
  }

  if (node.type === "heading" || node.type === "paragraph") {
    return `<p>${content}</p>`;
  }

  return content;
};
