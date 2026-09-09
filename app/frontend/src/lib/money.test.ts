import { describe, expect, it } from 'vitest';

import { formatCOP } from './money';

describe('formatCOP', () => {
  it('groups thousands and drops the cents the peso does not use', () => {
    expect(formatCOP(150000)).toBe('$150.000');
    expect(formatCOP(165000)).toBe('$165.000');
    expect(formatCOP(1500)).toBe('$1.500');
    expect(formatCOP(0)).toBe('$0');
  });

  it('rounds rather than showing a fractional peso', () => {
    expect(formatCOP(64.99)).toBe('$65');
    expect(formatCOP(150000.4)).toBe('$150.000');
  });

  it('leaves no spaces, so it stays tight in a card and copies cleanly', () => {
    expect(formatCOP(250000)).not.toMatch(/\s/);
  });

  it('degrades to zero instead of rendering NaN', () => {
    expect(formatCOP(Number.NaN)).toBe('$0');
    expect(formatCOP(Number.POSITIVE_INFINITY)).toBe('$0');
  });
});
