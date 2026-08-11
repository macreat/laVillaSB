const MEDIA_PROXY_BASE = '/api/media';

function normalizeLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

export function toSameOriginMediaUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return '';
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith(MEDIA_PROXY_BASE)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = normalizeLeadingSlash(parsed.pathname);
    const suffix = `${pathname}${parsed.search}`;
    return `${MEDIA_PROXY_BASE}${suffix}`;
  } catch {
    return `${MEDIA_PROXY_BASE}${normalizeLeadingSlash(trimmed)}`;
  }
}
