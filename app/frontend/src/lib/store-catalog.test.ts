import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';

import {
  displayCategoryGroup,
  deriveSubcategoryTabs,
  fetchStoreProduct,
  fetchStoreProducts,
  filterByCategoryAndSubcategory,
  filterByCategoryGroup,
  mapCatalogProduct,
  buildCategoryHref,
  normalizeCategory,
  resolveSubcategorySelection,
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

const DECK: StoreProduct = {
  id: '1',
  name: 'Dark Realm Deck',
  price: 64.99,
  categoryGroup: 'decks',
  image: '',
};

const APPAREL: StoreProduct = {
  id: '2',
  name: 'Lurk Tee',
  price: 32.0,
  categoryGroup: 'apparel',
  image: '',
};

const NO_GROUP: StoreProduct = {
  id: '7',
  name: 'Mystery Item',
  price: 10.0,
  categoryGroup: 'uncategorized',
  image: '',
};

describe('mapCatalogProduct', () => {
  it('maps categoryGroup lowercase and keeps existing fields', () => {
    const mapped = mapCatalogProduct({
      id: 1,
      name: 'Deck 8.0',
      price: '120.00',
      categoryGroup: 'Decks',
      imageUrl: null,
    });

    expect(mapped).toEqual({
      id: '1',
      name: 'Deck 8.0',
      price: 120,
      description: undefined,
      categoryGroup: 'decks',
      category: undefined,
      categorySubcategory: undefined,
      image: '',
    });
  });

  it('falls back to uncategorized when payload lacks categoryGroup', () => {
    const mapped = mapCatalogProduct({ id: 2, name: 'Tee', price: '30.00' });

    expect(mapped.categoryGroup).toBe('uncategorized');
  });

  it('keeps raw category and additive subcategory values', () => {
    const mapped = mapCatalogProduct({
      id: 3,
      name: 'Hoddie',
      price: 50,
      category: 'Ropa / Talla M',
      categoryGroup: 'apparel',
      categorySubcategory: 'Hoodies',
    });

    expect(mapped.category).toBe('Ropa / Talla M');
    expect(mapped.categorySubcategory).toBe('Hoodies');

    const uncategorized = mapCatalogProduct({
      id: 4,
      name: 'Mystery item',
      price: 10,
      category: null,
      categoryGroup: null,
      categorySubcategory: null,
    });

    expect(uncategorized.categorySubcategory).toBeNull();
  });
});

describe('filterByCategoryGroup', () => {
  it('returns only products matching the selected group', () => {
    const filtered = filterByCategoryGroup([DECK, APPAREL, NO_GROUP], 'decks');

    expect(filtered).toEqual([DECK]);
  });

  it('hides products without a group from group filters', () => {
    const filtered = filterByCategoryGroup([DECK, NO_GROUP], 'apparel');

    expect(filtered).toEqual([]);
  });

  it('returns the full list for all', () => {
    const filtered = filterByCategoryGroup([DECK, APPAREL, NO_GROUP], 'all');

    expect(filtered).toHaveLength(3);
    expect(filtered.map((p) => p.id)).toEqual(['1', '2', '7']);
  });
});

describe('subcategory derivation and filtering', () => {
  const products: StoreProduct[] = [
    { ...DECK, categorySubcategory: '8.25', category: 'Skate / Maderos / 8.25' },
    {
      ...APPAREL,
      id: '3',
      categorySubcategory: 'Hoodies',
      category: 'Ropa / Talla M',
    },
    {
      ...APPAREL,
      id: '4',
      categorySubcategory: 'Shoes',
      category: 'Tenis / Talla 8Us',
    },
    {
      ...APPAREL,
      id: '5',
      categorySubcategory: 'Future Family',
      category: 'Ropa / Unknown',
    },
    { ...APPAREL, id: '6', categorySubcategory: null, category: undefined },
  ];

  it('returns All plus populated known labels in the specified order', () => {
    expect(deriveSubcategoryTabs(products, 'apparel')).toEqual([
      'All',
      'Shoes',
      'Hoodies',
    ]);
  });

  it('orders deck sizes numerically and omits unsupported or empty labels', () => {
    const deckProducts = ['8.5', '7.75', 'Long Board', '8.125', 'Future Size'].map(
      (subcategory, index) => ({
        ...DECK,
        id: `deck-${index}`,
        categorySubcategory: subcategory,
      }),
    );

    expect(deriveSubcategoryTabs(deckProducts, 'decks')).toEqual([
      'All',
      '7.75',
      '8.125',
      '8.5',
      'Long Board',
    ]);
  });

  it('omits an empty known accessory label while keeping All discoverable', () => {
    const accessoryProducts: StoreProduct[] = [
      {
        id: 'accessory-bag',
        name: 'Waist Pack',
        price: 24,
        categoryGroup: 'accessories',
        categorySubcategory: 'Bags & Waist Packs',
      },
    ];

    expect(deriveSubcategoryTabs(accessoryProducts, 'accessories')).toEqual([
      'All',
      'Bags & Waist Packs',
    ]);
  });

  it('keeps unknown and uncategorized products in the group All result', () => {
    expect(filterByCategoryAndSubcategory(products, 'apparel', 'All').map((p) => p.id)).toEqual([
      '3',
      '4',
      '5',
      '6',
    ]);
  });

  it('filters by group and known subcategory in original order', () => {
    expect(filterByCategoryAndSubcategory(products, 'apparel', 'Hoodies').map((p) => p.id)).toEqual([
      '3',
    ]);
  });

  it('falls back to the group when a subcategory is stale or unknown', () => {
    expect(filterByCategoryAndSubcategory(products, 'apparel', 'Stale').map((p) => p.id)).toEqual([
      '3',
      '4',
      '5',
      '6',
    ]);
    expect(resolveSubcategorySelection(products, 'apparel', 'Stale')).toBe('All');
  });
});

describe('category URL state', () => {
  it('normalizes unsupported categories to all and encodes subcategory labels', () => {
    expect(normalizeCategory('not-a-group')).toBe('all');
    expect(buildCategoryHref('all')).toBe('/products');
    expect(buildCategoryHref('apparel', 'Jackets & Outerwear')).toBe(
      '/products?category=apparel&subcategory=Jackets+%26+Outerwear',
    );
  });
});

describe('displayCategoryGroup', () => {
  it('title-cases a stored group', () => {
    expect(displayCategoryGroup('decks')).toBe('Decks');
    expect(displayCategoryGroup('uncategorized')).toBe('Uncategorized');
  });

  it('falls back to Uncategorized when group is missing', () => {
    expect(displayCategoryGroup(undefined)).toBe('Uncategorized');
    expect(displayCategoryGroup('')).toBe('Uncategorized');
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

    expect(products.map((product) => product.id)).toEqual(['15', '3', '8']);
  });
});

describe('fetchStoreProduct', () => {
  it('maps live detail response using the same mapper contract', async () => {
    vi.mocked(api.proxyGet).mockResolvedValueOnce({
      id: 12,
      name: 'Dark Side Deck 8.5',
      price: '72.00',
      categoryGroup: 'Decks',
      imageUrl: 'http://localhost:9000/catalog-media/uploads/deck-12.png',
    });

    const product = await fetchStoreProduct('12');

    expect(product).toEqual({
      id: '12',
      name: 'Dark Side Deck 8.5',
      price: 72,
      description: undefined,
      categoryGroup: 'decks',
      image: '/api/media/catalog-media/uploads/deck-12.png',
    });
  });

  it('propagates not-found as Product not found error', async () => {
    vi.mocked(api.proxyGet).mockRejectedValueOnce(new Error('Product not found'));

    await expect(fetchStoreProduct('999')).rejects.toThrow('Product not found');
  });
});
