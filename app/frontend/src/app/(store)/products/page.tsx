'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/product/ProductCard';
import { fetchStoreProducts, type StoreProduct } from '@/lib/store-catalog';

const CATEGORIES = ['all', 'decks', 'apparel', 'accessories', 'gear'] as const;

function ProductsContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    fetchStoreProducts().then(setAllProducts);
  }, []);

  const filtered =
    activeCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

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
