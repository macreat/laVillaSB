/**
 * Env-driven external links used across the storefront.
 * Falls back to '#' when an env var is not configured so links never point
 * to a broken/placeholder destination.
 */
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#';
export const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || '#';

export function buildWhatsAppHref(text: string): string {
  if (WHATSAPP_URL === '#') return '#';
  const sep = WHATSAPP_URL.includes('?') ? '&' : '?';
  return `${WHATSAPP_URL}${sep}text=${encodeURIComponent(text)}`;
}

export const EXTERNAL_LINK_REL = 'noopener noreferrer';
