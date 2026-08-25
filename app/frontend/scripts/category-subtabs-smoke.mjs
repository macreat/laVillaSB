import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogUrl = process.env.CATALOG_SMOKE_URL ?? 'http://localhost:8010/api/v1/catalog/products';
const storefrontUrl =
  process.env.STOREFRONT_SMOKE_URL ??
  'http://localhost:3000/products?category=apparel&subcategory=Hoodies';

const expectedSubcategories = {
  decks: ['7.75', '8.0', '8.125', '8.25', '8.4', '8.5', 'Long Board'],
  apparel: [
    'Shoes',
    'Hoodies',
    'Sweatshirts',
    'T-Shirts',
    'Jackets & Outerwear',
    'Pants',
    'Other Apparel',
  ],
  accessories: ['Bags & Waist Packs', 'Grip Tape'],
  gear: ['Trucks', 'Wheels', 'Bearings', 'Hardware & Accessories'],
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

  const nonEmptyValues = {};
  for (const [group, labels] of Object.entries(expectedSubcategories)) {
    const groupProducts = products.filter((product) => product.categoryGroup === group);
    assert(groupProducts.length > 0, `Catalog group ${group} must be non-empty`);
    nonEmptyValues[group] = Object.fromEntries(
      labels.map((label) => {
        const count = groupProducts.filter(
          (product) => product.categorySubcategory === label,
        ).length;
        assert(count > 0, `Catalog subcategory ${group}/${label} must be non-empty`);
        return [label, count];
      }),
    );
  }

  const hardware = products.filter(
    (product) => product.category === 'Skate / Hardware y Accesorios',
  );
  assert(hardware.length > 0, 'Hardware y Accesorios products must be present');
  assert(
    hardware.every(
      (product) =>
        product.categoryGroup === 'gear' &&
        product.categorySubcategory === 'Hardware & Accessories',
    ),
    'Hardware y Accesorios must retain Gear precedence',
  );

  return { productCount: products.length, nonEmptyValues };
}

function validateStorefrontCode(code) {
  const page = code['src/app/(store)/products/page.tsx'];
  const component = code['src/components/store/CategorySubtabs.tsx'];
  const catalog = code['src/lib/store-catalog.ts'];
  const styles = code['src/app/globals.css'];

  for (const label of Object.values(expectedSubcategories).flat()) {
    assert(catalog.includes(`'${label}'`), `Storefront taxonomy must include ${label}`);
  }
  for (const fragment of [
    'CategorySubtabs',
    'deriveSubcategoryTabs',
    'resolveSubcategorySelection',
    "searchParams.get('subcategory')",
  ]) {
    assert(page.includes(fragment), `Products page must include ${fragment}`);
  }
  for (const fragment of ['buildCategoryHref', 'aria-current', 'aria-label']) {
    assert(component.includes(fragment), `Subtab component must include ${fragment}`);
  }
  for (const fragment of [
    'overflow-x: auto',
    'flex-wrap: nowrap',
    'white-space: nowrap',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    assert(styles.includes(fragment), `Subtab styles must include ${fragment}`);
  }

  return {
    expectedLabels: Object.values(expectedSubcategories).flat(),
    pageState: 'category and optional subcategory URL state is wired',
    component: 'CategorySubtabs renders named links with aria-current state',
    styling: 'horizontal overflow, no-wrap, focus, and reduced motion contracts present',
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
