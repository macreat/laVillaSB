import { api } from '@/lib/api';

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

const FALLBACK_PRODUCTS: StoreProduct[] = [
  { id: '1', name: 'Dark Realm Deck', price: 64.99, category: 'decks', image: '' },
  { id: '2', name: 'Lurk Tee', price: 32.0, category: 'apparel', image: '' },
  { id: '3', name: 'Hesh Wheels 54mm', price: 42.0, category: 'gear', image: '' },
  { id: '4', name: 'Creature Grip Tape', price: 18.0, category: 'accessories', image: '' },
  { id: '5', name: 'Prowler Deck 8.25', price: 68.0, category: 'decks', image: '' },
  { id: '6', name: 'Skull Logo Hoodie', price: 58.0, category: 'apparel', image: '' },
];

interface CatalogProduct {
  id: number;
  name: string;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
}

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  try {
    const data = await api.proxyGet<CatalogProduct[]>('catalog', 'products');
    const mapped = data.map((item) => ({
      id: String(item.id),
      name: item.name,
      price: Number(item.price),
      category: (item.category ?? 'uncategorized').toLowerCase(),
      image: item.imageUrl ?? '',
    }));

    return mapped.length > 0 ? mapped : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}
