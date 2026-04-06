export const normalizeLabel = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const buildTagKey = (name: string, variant: string | null): string => {
  const normalizedName = normalizeLabel(name);
  const normalizedVariant = variant ? normalizeLabel(variant) : "";

  return `${normalizedName}::${normalizedVariant}`;
};

export const buildCharacterKey = (name: string): string => normalizeLabel(name);
