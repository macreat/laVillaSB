import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const directory = dirname(fileURLToPath(import.meta.url));
const componentSource = readFileSync(resolve(directory, 'CategorySubtabs.tsx'), 'utf8');
const stylesSource = readFileSync(resolve(directory, '../../app/globals.css'), 'utf8');
const smokeSource = readFileSync(
  resolve(directory, '../../../scripts/category-subtabs-smoke.mjs'),
  'utf8',
);

describe('CategorySubtabs source contract', () => {
  it('exposes keyboard-focusable named links with active page semantics', () => {
    expect(componentSource).toMatch(/<a[\s\S]*?href=\{hrefFor\(tab\)\}/);
    expect(componentSource).toContain("aria-current={isActive ? 'page' : undefined}");
    expect(componentSource).toContain('aria-label={`View ${tab} products`}');
  });

  it('lets the caller own the navigation level so one row serves categories and sizes', () => {
    expect(componentSource).toContain('hrefFor: (tab: string) => string');
    expect(componentSource).toContain('aria-label={label}');
  });

  it('keeps the control in one horizontal overflow line', () => {
    expect(stylesSource).toMatch(/\.category-subtabs\s*\{[\s\S]*?overflow-x:\s*auto/);
    expect(stylesSource).toMatch(/\.category-subtabs__track\s*\{[\s\S]*?display:\s*flex/);
    expect(stylesSource).toMatch(/\.category-subtabs__track\s*\{[\s\S]*?flex-wrap:\s*nowrap/);
    expect(stylesSource).toMatch(/\.category-subtabs__link\s*\{[\s\S]*?white-space:\s*nowrap/);
  });

  it('keeps focus visible and disables motion under reduced motion', () => {
    expect(stylesSource).toContain('.category-subtabs__link:focus-visible');
    expect(stylesSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(stylesSource).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition:\s*none/,
    );
  });

  it('tiles the blue camo mark behind the buy-products grid', () => {
    expect(stylesSource).toMatch(
      /\.products-camo-bg::before\s*\{[\s\S]*?url\('\/brand\/pattern-camo-azul\.png'\)/,
    );
    expect(stylesSource).toMatch(
      /\.products-camo-bg::before\s*\{[\s\S]*?background-repeat:\s*repeat/,
    );
    expect(stylesSource).toMatch(/\.products-camo-bg > \*\s*\{[\s\S]*?z-index:\s*1/);
  });

  it('defines deterministic API and rendered-code-path smoke evidence', () => {
    expect(smokeSource).toContain('categorySection');
    expect(smokeSource).toContain('categoryKey');
    expect(smokeSource).toContain('categorySize');
    expect(smokeSource).toContain('CategorySubtabs');
    expect(smokeSource).toContain("searchParams.get('size')");
    expect(smokeSource).toContain('browserDom: false');
  });
});
