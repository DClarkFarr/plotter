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

export const renderNodeToHtml = (node: OfficeContentNode): string => {
  const content = renderInlineNode(node);

  if (!content) {
    return "";
  }

  if (node.type === "heading" || node.type === "paragraph") {
    return `<p>${content}</p>`;
  }

  return content;
};
