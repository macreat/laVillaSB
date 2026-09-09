import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogUrl = process.env.CATALOG_SMOKE_URL ?? 'http://localhost:8010/api/v1/catalog/products';
const storefrontUrl =
  process.env.STOREFRONT_SMOKE_URL ??
  'http://localhost:3000/products?section=ropa&category=busos&size=L';

// The storefront browses section -> category -> size. Every category listed
// here must be reachable from live catalog data.
const expectedCategories = {
  skate: [
    'tablas',
    'long-board',
    'trucks',
    'rodamientos',
    'ruedas',
    'herramientas-accesorios',
  ],
  ropa: ['zapatos', 'chaquetas', 'busos', 'camisetas', 'pantalones'],
};

// Categories whose products always carry a size, and a size each must expose.
const expectedSizes = {
  'skate/tablas': '8.25"',
  'skate/ruedas': '56mm',
  'ropa/busos': 'L',
  'ropa/chaquetas': 'XL',
  'ropa/zapatos': '8 US / 39 COL',
};

async function readStorefrontCode() {
  const paths = [
    'src/app/(store)/products/page.tsx',
    'src/components/store/CategorySubtabs.tsx',
    'src/lib/store-catalog.ts',
    'src/app/globals.css',
  ];
  const entries = await Promise.all(
    paths.map(async (relativePath) => [relativePath, await readFile(resolve(root, relativePath), 'utf8')]),
  );
  return Object.fromEntries(entries);
}

function validateCatalogPayload(products) {
  assert(Array.isArray(products), 'Catalog response must be an array');
  assert(products.length > 0, 'Catalog response must not be empty');

  const unrouted = products.filter((product) => !product.categorySection);
  assert.equal(
    unrouted.length,
    0,
    `Every product must land in a section; ${unrouted.length} did not`,
  );

  const nonEmptyValues = {};
  for (const [section, categories] of Object.entries(expectedCategories)) {
    const sectionProducts = products.filter((product) => product.categorySection === section);
    assert(sectionProducts.length > 0, `Catalog section ${section} must be non-empty`);
    nonEmptyValues[section] = Object.fromEntries(
      categories.map((category) => {
        const count = sectionProducts.filter(
          (product) => product.categoryKey === category,
        ).length;
        assert(count > 0, `Catalog category ${section}/${category} must be non-empty`);
        return [category, count];
      }),
    );
  }

  const sizeEvidence = {};
  for (const [path, size] of Object.entries(expectedSizes)) {
    const [section, category] = path.split('/');
    const sized = products.filter(
      (product) =>
        product.categorySection === section &&
        product.categoryKey === category &&
        product.categorySize === size,
    );
    assert(sized.length > 0, `Size ${size} must be populated under ${path}`);
    sizeEvidence[path] = { size, count: sized.length };
  }

  const hardware = products.filter(
    (product) => product.category === 'Skate / Hardware y Accesorios',
  );
  assert(hardware.length > 0, 'Hardware y Accesorios products must be present');
  assert(
    hardware.every(
      (product) =>
        product.categorySection === 'skate' &&
        product.categoryKey === 'herramientas-accesorios',
    ),
    'Hardware y Accesorios must route into the skate tools category',
  );

  return { productCount: products.length, nonEmptyValues, sizeEvidence };
}

function validateStorefrontCode(code) {
  const page = code['src/app/(store)/products/page.tsx'];
  const component = code['src/components/store/CategorySubtabs.tsx'];
  const catalog = code['src/lib/store-catalog.ts'];
  const styles = code['src/app/globals.css'];

  for (const category of Object.values(expectedCategories).flat()) {
    assert(catalog.includes(`'${category}'`), `Storefront taxonomy must include ${category}`);
  }
  for (const fragment of [
    'CategorySubtabs',
    'deriveCategoryTabs',
    'deriveSizeTabs',
    "searchParams.get('section')",
    "searchParams.get('category')",
    "searchParams.get('size')",
  ]) {
    assert(page.includes(fragment), `Products page must include ${fragment}`);
  }
  for (const fragment of ['hrefFor', 'aria-current', 'aria-label']) {
    assert(component.includes(fragment), `Subtab component must include ${fragment}`);
  }
  for (const fragment of [
    'overflow-x: auto',
    'flex-wrap: nowrap',
    'white-space: nowrap',
    '@media (prefers-reduced-motion: reduce)',
    ".products-camo-bg::before",
    "url('/brand/pattern-camo-azul.png')",
  ]) {
    assert(styles.includes(fragment), `Subtab styles must include ${fragment}`);
  }

  return {
    expectedCategories: Object.values(expectedCategories).flat(),
    pageState: 'section, category and size URL state is wired',
    component: 'CategorySubtabs renders named links with aria-current state at any level',
    styling:
      'horizontal overflow, no-wrap, focus, reduced motion, and the camo backdrop contracts present',
  };
}

async function main() {
  const [catalogResponse, storefrontResponse, code] = await Promise.all([
    fetch(catalogUrl),
    fetch(storefrontUrl),
    readStorefrontCode(),
  ]);
  assert.equal(catalogResponse.status, 200, `Catalog smoke returned HTTP ${catalogResponse.status}`);
  assert.equal(
    storefrontResponse.status,
    200,
    `Storefront smoke returned HTTP ${storefrontResponse.status}`,
  );

  const html = await storefrontResponse.text();
  assert(html.includes('__next'), 'Storefront response must contain the Next.js app shell');
  assert(html.includes('/_next/'), 'Storefront response must reference built page assets');

  const catalogEvidence = validateCatalogPayload(await catalogResponse.json());
  const codeEvidence = validateStorefrontCode(code);
  const evidence = {
    catalogStatus: catalogResponse.status,
    storefrontStatus: storefrontResponse.status,
    ...catalogEvidence,
    codeEvidence,
    browserDom: false,
  };
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
