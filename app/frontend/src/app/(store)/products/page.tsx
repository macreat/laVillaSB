'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProductCard } from '@/components/store/product/ProductCard';

const ALL_PRODUCTS = [
  { id: '1', name: 'Dark Realm Deck', price: 64.99, category: 'decks', image: '' },
  { id: '2', name: 'Lurk Tee', price: 32.00, category: 'apparel', image: '' },
  { id: '3', name: 'Hesh Wheels 54mm', price: 42.00, category: 'gear', image: '' },
  { id: '4', name: 'Creature Grip Tape', price: 18.00, category: 'accessories', image: '' },
  { id: '5', name: 'Prowler Deck 8.25', price: 68.00, category: 'decks', image: '' },
  { id: '6', name: 'Skull Logo Hoodie', price: 58.00, category: 'apparel', image: '' },
  { id: '7', name: 'Bones Reds Bearings', price: 24.99, category: 'gear', image: '' },
  { id: '8', name: 'Vomit King Deck 8.0', price: 62.00, category: 'decks', image: '' },
  { id: '9', name: 'Fiend Beanie', price: 22.00, category: 'apparel', image: '' },
  { id: '10', name: 'Spitfire Formula Four 52mm', price: 38.00, category: 'gear', image: '' },
  { id: '11', name: 'Creature Sticker Pack', price: 8.00, category: 'accessories', image: '' },
  { id: '12', name: 'Dark Side Deck 8.5', price: 72.00, category: 'decks', image: '' },
];

const CATEGORIES = ['all', 'decks', 'apparel', 'accessories', 'gear'] as const;

function ProductsContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const filtered =
    activeCategory === 'all'
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl uppercase tracking-wider text-text">
          {activeCategory === 'all' ? 'All Products' : activeCategory}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={cat === 'all' ? '/products' : `/products?category=${cat}`}
            className={
              activeCategory === cat
                ? 'btn-primary px-4 py-2 text-xs uppercase'
                : 'btn-secondary px-4 py-2 text-xs uppercase'
            }
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-text-muted">No products in this category yet.</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
