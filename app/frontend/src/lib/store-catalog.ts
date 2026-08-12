import { api } from '@/lib/api';
import { toSameOriginMediaUrl } from '@/lib/media-proxy';

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  categoryGroup: string;
  description?: string;
  image?: string;
}

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
  categoryGroup?: string | null;
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
