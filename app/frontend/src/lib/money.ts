/**
 * Colombian peso formatting for every price the storefront shows.
 *
 * Prices are stored and served as plain numbers. Rendering them with
 * `toFixed(2)` produced "$150000.00": no thousand separator, and cents the
 * peso does not use in practice. That reads as a different number at a glance
 * and contradicts the price tags printed on the product photos themselves.
 */
const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Render a peso amount as `$150.000`. */
export function formatCOP(amount: number): string {
  if (!Number.isFinite(amount)) return '$0';
  // es-CO puts a non-breaking space after the symbol; drop it so the price
  // stays tight in a card and copies cleanly into a WhatsApp message.
  return COP.format(Math.round(amount)).replace(/ /g, '');
}
