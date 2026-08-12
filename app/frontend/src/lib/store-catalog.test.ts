import { describe, expect, it } from 'vitest';

import {
  displayCategoryGroup,
  filterByCategoryGroup,
  mapCatalogProduct,
  type StoreProduct,
} from './store-catalog';

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
      categoryGroup: 'decks',
      image: '',
    });
  });

  it('falls back to uncategorized when payload lacks categoryGroup', () => {
    const mapped = mapCatalogProduct({ id: 2, name: 'Tee', price: '30.00' });

    expect(mapped.categoryGroup).toBe('uncategorized');
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