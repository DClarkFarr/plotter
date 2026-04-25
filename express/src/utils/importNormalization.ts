export const normalizeLabel = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const canonicalizeDisplayName = (value: string): string => {
  const compact = value.trim().replace(/\s+/g, " ");
  if (!compact) {
    return "";
  }

  return compact
    .split(" ")
    .map((token) => {
      const upper = token.toUpperCase();
      const hasLetter = /[a-z]/i.test(token);

      if (hasLetter && token === upper && token.length <= 4) {
        return token;
      }

      return token
        .split(/([-'])/)
        .map((part) => {
          if (part === "-" || part === "'") {
            return part;
          }

          const lower = part.toLowerCase();
          if (!lower) {
            return lower;
          }

          return `${lower[0]?.toUpperCase() ?? ""}${lower.slice(1)}`;
        })
        .join("");
    })
    .join(" ");
};

export const buildTagKey = (name: string, variant: string | null): string => {
  const normalizedName = normalizeLabel(name);
  const normalizedVariant = variant ? normalizeLabel(variant) : "";

  return `${normalizedName}::${normalizedVariant}`;
};

export const buildCharacterKey = (name: string): string => normalizeLabel(name);

export const canonicalizeTag = (
  name: string,
  variant: string | null,
): { name: string; variant: string | null } => {
  const canonicalName = canonicalizeDisplayName(name);
  const canonicalVariant =
    variant && variant.trim().length > 0
      ? canonicalizeDisplayName(variant)
      : null;

  return {
    name: canonicalName,
    variant: canonicalVariant,
  };
};
