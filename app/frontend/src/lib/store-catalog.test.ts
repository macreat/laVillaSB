import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';

import {
  ALL_TAB,
  buildStoreHref,
  deriveCategoryTabs,
  deriveSizeTabs,
  displayCategoryGroup,
  displaySection,
  displayTab,
  fetchStoreProduct,
  fetchStoreProducts,
  filterProducts,
  mapCatalogProduct,
  normalizeCategoryKey,
  normalizeSection,
  normalizeSize,
  sizeSortKey,
  type StoreProduct,
} from './store-catalog';

vi.mock('@/lib/api', () => ({
  api: {
    proxyGet: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function product(overrides: Partial<StoreProduct> & { id: string }): StoreProduct {
  return {
    name: `Product ${overrides.id}`,
    price: 10,
    categoryGroup: 'uncategorized',
    categorySection: null,
    categoryKey: null,
    categorySize: null,
    image: '',
    ...overrides,
  };
}

const DECK = product({
  id: '1',
  name: 'Dark Realm Deck',
  price: 64.99,
  categoryGroup: 'decks',
  categorySection: 'skate',
  categoryKey: 'tablas',
  categorySize: '8.25"',
});

const HOODIE = product({
  id: '2',
  name: 'Skull Logo Hoodie',
  price: 58,
  categoryGroup: 'apparel',
  categorySection: 'ropa',
  categoryKey: 'busos',
  categorySize: 'L',
});

const SHOE = product({
  id: '3',
  name: 'Nike SB',
  price: 120,
  categoryGroup: 'apparel',
  categorySection: 'ropa',
  categoryKey: 'zapatos',
  categorySize: '8 US / 39 COL',
});

const GRIP = product({
  id: '4',
  name: 'Grizzly Naranjas',
  price: 18,
  categoryGroup: 'accessories',
  categorySection: 'skate',
  categoryKey: 'herramientas-accesorios',
  categorySize: null,
});

const UNROUTED = product({ id: '9', name: 'Mystery Item' });

const CATALOG = [DECK, HOODIE, SHOE, GRIP, UNROUTED];

describe('mapCatalogProduct', () => {
  it('maps the three-level taxonomy alongside the legacy group', () => {
    const mapped = mapCatalogProduct({
      id: 1,
      name: 'Deck 8.0',
      price: '120.00',
      category: 'Skate / Maderos / 8.0',
      categoryGroup: 'Decks',
      categorySubcategory: '8.0',
      categorySection: 'skate',
      categoryKey: 'tablas',
      categorySize: '8.0"',
      imageUrl: null,
    });

    expect(mapped).toEqual({
      id: '1',
      name: 'Deck 8.0',
      price: 120,
      description: undefined,
      category: 'Skate / Maderos / 8.0',
      categoryGroup: 'decks',
      categorySubcategory: '8.0',
      categorySection: 'skate',
      categoryKey: 'tablas',
      categorySize: '8.0"',
      image: '',
    });
  });

  it('falls back to uncategorized and null taxonomy when the payload omits them', () => {
    const mapped = mapCatalogProduct({ id: 2, name: 'Tee', price: '30.00' });

    expect(mapped.categoryGroup).toBe('uncategorized');
    expect(mapped.categorySection).toBeNull();
    expect(mapped.categoryKey).toBeNull();
    expect(mapped.categorySize).toBeNull();
  });
});

describe('section and category URL state', () => {
  it('normalizes an unsupported section to all', () => {
    expect(normalizeSection('skate')).toBe('skate');
    expect(normalizeSection('ropa')).toBe('ropa');
    expect(normalizeSection('not-a-section')).toBe('all');
    expect(normalizeSection(null)).toBe('all');
  });

  it('keeps a category only when it belongs to the section', () => {
    expect(normalizeCategoryKey('skate', 'tablas')).toBe('tablas');
    expect(normalizeCategoryKey('ropa', 'tablas')).toBe(ALL_TAB);
    expect(normalizeCategoryKey('skate', null)).toBe(ALL_TAB);
  });

  it('builds hrefs that drop levels below the one being linked', () => {
    expect(buildStoreHref('all')).toBe('/products');
    expect(buildStoreHref('skate')).toBe('/products?section=skate');
    expect(buildStoreHref('skate', 'tablas')).toBe('/products?section=skate&category=tablas');
    expect(buildStoreHref('skate', 'tablas', '8.25"')).toBe(
      '/products?section=skate&category=tablas&size=8.25%22',
    );
    // A size without a category has nothing to filter, so it is dropped.
    expect(buildStoreHref('skate', ALL_TAB, '8.25"')).toBe('/products?section=skate');
  });
});

describe('deriveCategoryTabs', () => {
  it('lists only the categories of the section that hold products, in taxonomy order', () => {
    expect(deriveCategoryTabs(CATALOG, 'skate')).toEqual([
      ALL_TAB,
      'tablas',
      'herramientas-accesorios',
    ]);
    expect(deriveCategoryTabs(CATALOG, 'ropa')).toEqual([ALL_TAB, 'zapatos', 'busos']);
  });

  it('offers no category breakdown at the all-products root', () => {
    expect(deriveCategoryTabs(CATALOG, 'all')).toEqual([ALL_TAB]);
  });
});

describe('deriveSizeTabs', () => {
  it('lists the sizes present in the category', () => {
    const busos = [
      HOODIE,
      product({ ...HOODIE, id: '5', categorySize: 'S' }),
      product({ ...HOODIE, id: '6', categorySize: 'XL' }),
      product({ ...HOODIE, id: '7', categorySize: 'M' }),
    ];

    expect(deriveSizeTabs(busos, 'ropa', 'busos')).toEqual([ALL_TAB, 'S', 'M', 'L', 'XL']);
  });

  it('collapses to All when the category has no sized products', () => {
    expect(deriveSizeTabs(CATALOG, 'skate', 'herramientas-accesorios')).toEqual([ALL_TAB]);
  });

  it('collapses to All before a category is chosen', () => {
    expect(deriveSizeTabs(CATALOG, 'skate', ALL_TAB)).toEqual([ALL_TAB]);
  });
});

describe('sizeSortKey', () => {
  it('orders apparel by scale, everything else numerically, unknowns last', () => {
    expect(['XL', 'S', 'L', 'M'].sort((a, b) => sizeSortKey(a)[1] - sizeSortKey(b)[1])).toEqual([
      'S',
      'M',
      'L',
      'XL',
    ]);
    expect(sizeSortKey('L')[0]).toBe(0);
    expect(sizeSortKey('8.25"')[0]).toBe(1);
    expect(sizeSortKey('8.25"')[1]).toBe(8.25);
    expect(sizeSortKey('ABEC 9')[1]).toBe(9);
    expect(sizeSortKey('Talla unica')[0]).toBe(2);
  });
});

describe('filterProducts', () => {
  it('returns everything at the all-products root, unrouted products included', () => {
    expect(filterProducts(CATALOG, 'all').map((p) => p.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '9',
    ]);
  });

  it('narrows by section, then category, then size', () => {
    expect(filterProducts(CATALOG, 'skate').map((p) => p.id)).toEqual(['1', '4']);
    expect(filterProducts(CATALOG, 'skate', 'tablas').map((p) => p.id)).toEqual(['1']);
    expect(filterProducts(CATALOG, 'skate', 'tablas', '8.25"').map((p) => p.id)).toEqual(['1']);
    expect(filterProducts(CATALOG, 'skate', 'tablas', '7.75"')).toEqual([]);
  });

  it('falls back to the section when the category does not belong to it', () => {
    expect(filterProducts(CATALOG, 'ropa', 'tablas').map((p) => p.id)).toEqual(['2', '3']);
  });
});

describe('normalizeSize', () => {
  it('keeps a size that the category actually offers', () => {
    expect(normalizeSize(CATALOG, 'skate', 'tablas', '8.25"')).toBe('8.25"');
  });

  it('drops a stale or unknown size back to All', () => {
    expect(normalizeSize(CATALOG, 'skate', 'tablas', '9.99"')).toBe(ALL_TAB);
    expect(normalizeSize(CATALOG, 'skate', 'tablas', null)).toBe(ALL_TAB);
  });
});

describe('labels', () => {
  it('names sections and category keys in Spanish', () => {
    expect(displaySection('skate')).toBe('Skate');
    expect(displaySection('ropa')).toBe('Ropa');
    expect(displaySection('all')).toBe('Todos');
    expect(displaySection(undefined)).toBe('Sin Seccion');

    expect(displayTab('herramientas-accesorios')).toBe('Herramientas y Accesorios');
    expect(displayTab('zapatos')).toBe('Zapatos');
    // Sizes are already display-ready and pass through untouched.
    expect(displayTab('8.25"')).toBe('8.25"');
    expect(displayTab(ALL_TAB)).toBe(ALL_TAB);
  });

  it('still labels the legacy group used by the admin table', () => {
    expect(displayCategoryGroup('decks')).toBe('Tablas');
    expect(displayCategoryGroup('apparel')).toBe('Ropa');
    expect(displayCategoryGroup(undefined)).toBe('Sin Categoria');
  });
});

describe('fetchStoreProducts', () => {
  it('preserves server ordering from catalog response', async () => {
    vi.mocked(api.proxyGet).mockResolvedValueOnce([
      { id: 15, name: 'Server order third', price: '10.00', categoryGroup: 'apparel' },
      { id: 3, name: 'Server order first', price: '20.00', categoryGroup: 'decks' },
      { id: 8, name: 'Server order second', price: '30.00', categoryGroup: 'gear' },
    ]);

    const products = await fetchStoreProducts();

    expect(products.map((p) => p.id)).toEqual(['15', '3', '8']);
  });
});

describe('fetchStoreProduct', () => {
  it('maps live detail response using the same mapper contract', async () => {
    vi.mocked(api.proxyGet).mockResolvedValueOnce({
      id: 12,
      name: 'Dark Side Deck 8.5',
      price: '72.00',
      categoryGroup: 'Decks',
      categorySection: 'skate',
      categoryKey: 'tablas',
      categorySize: '8.5"',
      imageUrl: 'http://localhost:9000/catalog-media/uploads/deck-12.png',
    });

    const detail = await fetchStoreProduct('12');

    expect(detail).toEqual({
      id: '12',
      name: 'Dark Side Deck 8.5',
      price: 72,
      description: undefined,
      category: undefined,
      categoryGroup: 'decks',
      categorySubcategory: undefined,
      categorySection: 'skate',
      categoryKey: 'tablas',
      categorySize: '8.5"',
      image: '/api/media/catalog-media/uploads/deck-12.png',
    });
  });

  it('propagates not-found as Product not found error', async () => {
    vi.mocked(api.proxyGet).mockRejectedValueOnce(new Error('Product not found'));

    await expect(fetchStoreProduct('999')).rejects.toThrow('Product not found');
  });
});
