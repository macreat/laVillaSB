/**
 * Env-driven external links used across the storefront.
 * Falls back to '#' when an env var is not configured so links never point
 * to a broken/placeholder destination.
 */
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#';
export const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || '#';

export const EXTERNAL_LINK_REL = 'noopener noreferrer';
