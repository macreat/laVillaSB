import { api } from '@/lib/api';
import { toSameOriginMediaUrl } from '@/lib/media-proxy';

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  categoryGroup: string;
  category?: string;
  categorySubcategory?: string | null;
  /** Top storefront section the catalog service routed this product into. */
  categorySection?: string | null;
  /** Browsable category inside the section (`tablas`, `zapatos`, ...). */
  categoryKey?: string | null;
  /** Size or measure a shopper filters by, when the product has one. */
  categorySize?: string | null;
  description?: string;
  image?: string;
}

/** The storefront browses section -> category -> size. `all` is the unfiltered root. */
export const SECTIONS = ['all', 'skate', 'ropa'] as const;

const SECTION_LABELS: Record<string, string> = {
  all: 'Todos',
  skate: 'Skate',
  ropa: 'Ropa',
};

/** Category order per section mirrors `taxonomy.py` in the catalog service. */
const SECTION_CATEGORIES: Record<string, readonly string[]> = {
  skate: [
    'tablas',
    'long-board',
    'trucks',
    'rodamientos',
    'ruedas',
    'herramientas-accesorios',
  ],
  ropa: ['zapatos', 'chaquetas', 'busos', 'camisetas', 'pantalones', 'otros'],
};

const CATEGORY_LABELS: Record<string, string> = {
  tablas: 'Tablas',
  'long-board': 'Long Board',
  trucks: 'Trucks',
  rodamientos: 'Rodamientos',
  ruedas: 'Ruedas',
  'herramientas-accesorios': 'Herramientas y Accesorios',
  zapatos: 'Zapatos',
  chaquetas: 'Chaquetas',
  busos: 'Busos',
  camisetas: 'Camisetas',
  pantalones: 'Pantalones',
  otros: 'Otros',
};

/** Legacy group labels, still used by the admin product table. */
const CATEGORY_GROUP_LABELS: Record<string, string> = {
  all: 'Todos',
  decks: 'Tablas',
  apparel: 'Ropa',
  accessories: 'Accesorios',
  gear: 'Equipo',
};

export const ALL_TAB = 'Todos';

const APPAREL_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const FALLBACK_PRODUCTS: StoreProduct[] = [
  {
    id: '1',
    name: 'Dark Realm Deck',
    price: 64.99,
    categoryGroup: 'decks',
    categorySection: 'skate',
    categoryKey: 'tablas',
    categorySize: '8.25"',
    image: '',
  },
  {
    id: '2',
    name: 'Lurk Tee',
    price: 32.0,
    categoryGroup: 'apparel',
    categorySection: 'ropa',
    categoryKey: 'camisetas',
    categorySize: 'M',
    image: '',
  },
  {
    id: '3',
    name: 'Hesh Wheels 54mm',
    price: 42.0,
    categoryGroup: 'gear',
    categorySection: 'skate',
    categoryKey: 'ruedas',
    categorySize: '54mm',
    image: '',
  },
  {
    id: '4',
    name: 'Creature Grip Tape',
    price: 18.0,
    categoryGroup: 'accessories',
    categorySection: 'skate',
    categoryKey: 'herramientas-accesorios',
    categorySize: null,
    image: '',
  },
  {
    id: '5',
    name: 'Prowler Deck 8.25',
    price: 68.0,
    categoryGroup: 'decks',
    categorySection: 'skate',
    categoryKey: 'tablas',
    categorySize: '8.25"',
    image: '',
  },
  {
    id: '6',
    name: 'Skull Logo Hoodie',
    price: 58.0,
    categoryGroup: 'apparel',
    categorySection: 'ropa',
    categoryKey: 'busos',
    categorySize: 'L',
    image: '',
  },
];

interface CatalogProduct {
  id: number;
  name: string;
  price: number | string;
  description?: string | null;
  category?: string | null;
  categoryGroup?: string | null;
  categorySubcategory?: string | null;
  categorySection?: string | null;
  categoryKey?: string | null;
  categorySize?: string | null;
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
    categorySection: item.categorySection ?? null,
    categoryKey: item.categoryKey ?? null,
    categorySize: item.categorySize ?? null,
    description: item.description ?? undefined,
    categoryGroup: (item.categoryGroup ?? 'uncategorized').toLowerCase(),
    image: toSameOriginMediaUrl(item.imageUrl),
  };
}

export function normalizeSection(section: string | null | undefined): string {
  const normalized = (section ?? '').trim().toLowerCase();
  return SECTIONS.includes(normalized as (typeof SECTIONS)[number]) ? normalized : 'all';
}

/**
 * Resolve a requested category to one that exists inside the section, falling
 * back to `Todos` so a stale or hand-typed URL still renders the section.
 */
export function normalizeCategoryKey(
  section: string | null | undefined,
  categoryKey: string | null | undefined,
): string {
  const normalizedSection = normalizeSection(section);
  const requested = (categoryKey ?? '').trim().toLowerCase();
  if (!requested || requested === ALL_TAB.toLowerCase()) return ALL_TAB;
  return (SECTION_CATEGORIES[normalizedSection] ?? []).includes(requested)
    ? requested
    : ALL_TAB;
}

/** Categories of a section that actually have products behind them. */
export function deriveCategoryTabs(products: StoreProduct[], section: string): string[] {
  const normalizedSection = normalizeSection(section);
  if (normalizedSection === 'all') return [ALL_TAB];

  const populated = new Set(
    products
      .filter((product) => product.categorySection === normalizedSection)
      .map((product) => product.categoryKey)
      .filter((key): key is string => Boolean(key)),
  );

  return [
    ALL_TAB,
    ...(SECTION_CATEGORIES[normalizedSection] ?? []).filter((key) => populated.has(key)),
  ];
}

export function sizeSortKey(size: string): [number, number, string] {
  const normalized = size.trim().toUpperCase();

  const apparelIndex = APPAREL_SIZE_ORDER.indexOf(normalized);
  if (apparelIndex !== -1) return [0, apparelIndex, normalized];

  const firstNumber = normalized.match(/\d+(?:\.\d+)?/);
  if (firstNumber) return [1, Number(firstNumber[0]), normalized];

  return [2, 0, normalized];
}

function compareSizes(a: string, b: string): number {
  const [aBucket, aValue, aText] = sizeSortKey(a);
  const [bBucket, bValue, bText] = sizeSortKey(b);
  if (aBucket !== bBucket) return aBucket - bBucket;
  if (aValue !== bValue) return aValue - bValue;
  return aText.localeCompare(bText);
}

/** Sizes available inside one category, ordered S->XL then numerically. */
export function deriveSizeTabs(
  products: StoreProduct[],
  section: string,
  categoryKey: string,
): string[] {
  const normalizedSection = normalizeSection(section);
  const normalizedCategory = normalizeCategoryKey(normalizedSection, categoryKey);
  if (normalizedSection === 'all' || normalizedCategory === ALL_TAB) return [ALL_TAB];

  const sizes = new Set(
    products
      .filter(
        (product) =>
          product.categorySection === normalizedSection &&
          product.categoryKey === normalizedCategory,
      )
      .map((product) => product.categorySize)
      .filter((size): size is string => Boolean(size)),
  );

  if (sizes.size === 0) return [ALL_TAB];
  return [ALL_TAB, ...[...sizes].sort(compareSizes)];
}

export function normalizeSize(
  products: StoreProduct[],
  section: string,
  categoryKey: string,
  requestedSize: string | null | undefined,
): string {
  if (!requestedSize || requestedSize === ALL_TAB) return ALL_TAB;
  const tabs = deriveSizeTabs(products, section, categoryKey);
  return tabs.includes(requestedSize) ? requestedSize : ALL_TAB;
}

export function filterProducts(
  products: StoreProduct[],
  section: string,
  categoryKey: string = ALL_TAB,
  size: string = ALL_TAB,
): StoreProduct[] {
  const normalizedSection = normalizeSection(section);
  if (normalizedSection === 'all') return products;

  const normalizedCategory = normalizeCategoryKey(normalizedSection, categoryKey);
  let result = products.filter((product) => product.categorySection === normalizedSection);

  if (normalizedCategory === ALL_TAB) return result;
  result = result.filter((product) => product.categoryKey === normalizedCategory);

  if (!size || size === ALL_TAB) return result;
  return result.filter((product) => product.categorySize === size);
}

export function buildStoreHref(
  section: string,
  categoryKey?: string,
  size?: string,
): string {
  const normalizedSection = normalizeSection(section);
  if (normalizedSection === 'all') return '/products';

  const params = new URLSearchParams({ section: normalizedSection });
  if (categoryKey && categoryKey !== ALL_TAB) {
    params.set('category', categoryKey);
    if (size && size !== ALL_TAB) {
      params.set('size', size);
    }
  }
  return `/products?${params.toString()}`;
}

export function displaySection(section: string | undefined): string {
  const normalized = (section ?? '').trim().toLowerCase();
  return SECTION_LABELS[normalized] ?? 'Sin Seccion';
}

/** Label a category key, a size, or the `Todos` tab with one call. */
export function displayTab(tab: string | undefined): string {
  if (!tab) return '';
  return CATEGORY_LABELS[tab] ?? tab;
}

export function displayCategoryGroup(group: string | undefined): string {
  const normalized = (group ?? '').trim().toLowerCase();
  return CATEGORY_GROUP_LABELS[normalized] ?? 'Sin Categoria';
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

export interface NLSearchResult {
  filters: {
    keywords: string[];
    category_group: string | null;
    subcategory: string | null;
    min_price: number | null;
    max_price: number | null;
    brand_keywords: string[];
  };
  products: CatalogProduct[];
}

export async function fetchNLSearch(query: string): Promise<StoreProduct[]> {
  try {
    const data = await api.proxyPost<NLSearchResult>('catalog', 'search', { query });
    return data.products.map(mapCatalogProduct);
  } catch {
    return [];
  }
}
