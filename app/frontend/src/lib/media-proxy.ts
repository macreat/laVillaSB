const MEDIA_PROXY_BASE = '/api/media';

function isSafePath(path: string): boolean {
  const segments = path.split('/').filter(Boolean);
  return segments.every((segment) => segment !== '..');
}

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
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    const pathname = normalizeLeadingSlash(parsed.pathname);
    if (!isSafePath(pathname)) {
      return '';
    }
    const suffix = `${pathname}${parsed.search}`;
    return `${MEDIA_PROXY_BASE}${suffix}`;
  } catch {
    const normalized = normalizeLeadingSlash(trimmed);
    if (!isSafePath(normalized)) {
      return '';
    }
    return `${MEDIA_PROXY_BASE}${normalized}`;
  }
}
