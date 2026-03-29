export const resolveCharacterImageUrl = (
  imageUrl?: string | null,
): string | null => {
  if (!imageUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const baseUrl =
    (import.meta.env.VITE_CDN_BASE_URL as string | undefined) ?? "";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}${imageUrl}`;
};
