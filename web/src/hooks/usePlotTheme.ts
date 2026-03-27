import { useMemo } from "react";

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type PlotTheme = {
  baseColor: string;
  softColor: string;
  textColor: string;
};

const FALLBACK_COLOR = "#e2e8f0";
const DARK_TEXT = "#0f172a";
const LIGHT_TEXT = "#f8fafc";
const BLEND_ALPHA = 0.45;
const LIGHT_LUMINANCE_THRESHOLD = 0.6;
const MIN_CONTRAST_RATIO = 6;

const WHITE: RgbColor = { r: 255, g: 255, b: 255 };
const BLACK: RgbColor = { r: 0, g: 0, b: 0 };

const clamp = (value: number, min = 0, max = 255) =>
  Math.min(max, Math.max(min, value));

const parseHexColor = (value?: string): RgbColor | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const normalized = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16);
    const g = Number.parseInt(normalized[1] + normalized[1], 16);
    const b = Number.parseInt(normalized[2] + normalized[2], 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) {
      return null;
    }
    return { r, g, b };
  }

  if (normalized.length === 6) {
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) {
      return null;
    }
    return { r, g, b };
  }

  return null;
};

const toHexChannel = (value: number) =>
  clamp(Math.round(value)).toString(16).padStart(2, "0");

const toHexColor = ({ r, g, b }: RgbColor) =>
  `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;

const relativeLuminance = ({ r, g, b }: RgbColor) => {
  const transform = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const rLinear = transform(r);
  const gLinear = transform(g);
  const bLinear = transform(b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

const contrastRatio = (colorA: RgbColor, colorB: RgbColor) => {
  const luminanceA = relativeLuminance(colorA);
  const luminanceB = relativeLuminance(colorB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
};

const blendColors = (
  foreground: RgbColor,
  background: RgbColor,
  alpha: number,
) => ({
  r: foreground.r * alpha + background.r * (1 - alpha),
  g: foreground.g * alpha + background.g * (1 - alpha),
  b: foreground.b * alpha + background.b * (1 - alpha),
});

const normalizeBaseColor = (plotColor?: string) => {
  const parsed = parseHexColor(plotColor);
  return parsed ? toHexColor(parsed) : FALLBACK_COLOR;
};

export function usePlotTheme(plotColor?: string): PlotTheme {
  return useMemo(() => {
    const baseColor = normalizeBaseColor(plotColor);
    const baseRgb = parseHexColor(baseColor) ?? parseHexColor(FALLBACK_COLOR);

    if (!baseRgb) {
      return {
        baseColor: FALLBACK_COLOR,
        softColor: FALLBACK_COLOR,
        textColor: DARK_TEXT,
      };
    }

    const luminance = relativeLuminance(baseRgb);
    const isLight = luminance > LIGHT_LUMINANCE_THRESHOLD;
    const softRgb = blendColors(baseRgb, isLight ? WHITE : BLACK, BLEND_ALPHA);

    const darkTextRgb = parseHexColor(DARK_TEXT) ?? BLACK;
    // const lightTextRgb = parseHexColor(LIGHT_TEXT) ?? WHITE;
    const darkContrast = contrastRatio(softRgb, darkTextRgb);
    const textColor =
      darkContrast < MIN_CONTRAST_RATIO ? LIGHT_TEXT : DARK_TEXT;

    return {
      baseColor,
      softColor: toHexColor(softRgb),
      textColor,
    };
  }, [plotColor]);
}
