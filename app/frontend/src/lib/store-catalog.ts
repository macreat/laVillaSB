import { api } from '@/lib/api';
import { toSameOriginMediaUrl } from '@/lib/media-proxy';

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  categoryGroup: string;
  category?: string;
  categorySubcategory?: string | null;
  description?: string;
  image?: string;
}

export const CATEGORIES = ['all', 'decks', 'apparel', 'accessories', 'gear'] as const;

const SUBCATEGORY_LABELS: Record<string, readonly string[]> = {
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

const FALLBACK_PRODUCTS: StoreProduct[] = [
  { id: '1', name: 'Dark Realm Deck', price: 64.99, categoryGroup: 'decks', image: '' },
  { id: '2', name: 'Lurk Tee', price: 32.0, categoryGroup: 'apparel', image: '' },
  { id: '3', name: 'Hesh Wheels 54mm', price: 42.0, categoryGroup: 'gear', image: '' },
  { id: '4', name: 'Creature Grip Tape', price: 18.0, categoryGroup: 'accessories', image: '' },
  { id: '5', name: 'Prowler Deck 8.25', price: 68.0, categoryGroup: 'decks', image: '' },
  { id: '6', name: 'Skull Logo Hoodie', price: 58.0, categoryGroup: 'apparel', image: '' },
];

interface CatalogProduct {
  id: number;
  name: string;
  price: number | string;
  description?: string | null;
  category?: string | null;
  categoryGroup?: string | null;
  categorySubcategory?: string | null;
  imageUrl?: string | null;
}

interface ApiError {
  message?: string;
}

export function mapCatalogProduct(item: CatalogProduct): StoreProduct {
  return {
    id: String(item.id),
    name: item.name,
    price: Number(item.price),
    category: item.category ?? undefined,
    categorySubcategory: item.categorySubcategory,
    description: item.description ?? undefined,
    categoryGroup: (item.categoryGroup ?? 'uncategorized').toLowerCase(),
    image: toSameOriginMediaUrl(item.imageUrl),
  };
}

export function filterByCategoryGroup(
  products: StoreProduct[],
  group: string,
): StoreProduct[] {
  if (group === 'all') {
    return products;
  }
  return products.filter((product) => product.categoryGroup === group);
}

export function normalizeCategory(group: string | null | undefined): string {
  const normalized = (group ?? '').trim().toLowerCase();
  return CATEGORIES.includes(normalized as (typeof CATEGORIES)[number]) ? normalized : 'all';
}

export function deriveSubcategoryTabs(products: StoreProduct[], group: string): string[] {
  const normalizedGroup = normalizeCategory(group);
  if (normalizedGroup === 'all') {
    return ['All'];
  }

  const populated = new Set(
    products
      .filter((product) => product.categoryGroup.toLowerCase() === normalizedGroup)
      .map((product) => product.categorySubcategory)
      .filter((subcategory): subcategory is string => Boolean(subcategory)),
  );

  return [
    'All',
    ...(SUBCATEGORY_LABELS[normalizedGroup] ?? []).filter((label) => populated.has(label)),
  ];
}

export function resolveSubcategorySelection(
  products: StoreProduct[],
  group: string,
  requestedSubcategory: string | null | undefined,
): string {
  if (!requestedSubcategory || requestedSubcategory === 'All') {
    return 'All';
  }
  return deriveSubcategoryTabs(products, group).includes(requestedSubcategory)
    ? requestedSubcategory
    : 'All';
}

export function filterByCategoryAndSubcategory(
  products: StoreProduct[],
  group: string,
  requestedSubcategory?: string | null,
): StoreProduct[] {
  const normalizedGroup = normalizeCategory(group);
  const groupProducts = filterByCategoryGroup(products, normalizedGroup);
  if (normalizedGroup === 'all') {
    return groupProducts;
  }

  const subcategory = resolveSubcategorySelection(products, normalizedGroup, requestedSubcategory);
  if (subcategory === 'All') {
    return groupProducts;
  }
  return groupProducts.filter((product) => product.categorySubcategory === subcategory);
}

export function buildCategoryHref(group: string, subcategory?: string): string {
  const normalizedGroup = normalizeCategory(group);
  if (normalizedGroup === 'all') {
    return '/products';
  }

  const params = new URLSearchParams({ category: normalizedGroup });
  if (subcategory && subcategory !== 'All') {
    params.set('subcategory', subcategory);
  }
  return `/products?${params.toString()}`;
}

export function displayCategoryGroup(group: string | undefined): string {
  const normalized = (group ?? '').trim().toLowerCase();
  if (!normalized) {
    return 'Uncategorized';
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  try {
    const data = await api.proxyGet<CatalogProduct[]>('catalog', 'products');
    const mapped = data.map(mapCatalogProduct);

    return mapped.length > 0 ? mapped : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchStoreProduct(id: string): Promise<StoreProduct> {
  try {
    const data = await api.proxyGet<CatalogProduct>('catalog', `products/${id}`);
    return mapCatalogProduct(data);
  } catch (error: unknown) {
    const maybeError = error as ApiError;
    if ((maybeError.message || '').toLowerCase().includes('not found')) {
      throw new Error('Product not found');
    }
    throw error;
  }
}
