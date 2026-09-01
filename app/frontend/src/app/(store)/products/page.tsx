'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CategorySubtabs } from '@/components/store/CategorySubtabs';
import { ProductCard } from '@/components/store/product/ProductCard';
import {
  buildCategoryHref,
  CATEGORIES,
  deriveSubcategoryTabs,
  displayCategoryGroup,
  fetchStoreProducts,
  filterByCategoryAndSubcategory,
  normalizeCategory,
  resolveSubcategorySelection,
  type StoreProduct,
} from '@/lib/store-catalog';

function ProductsContent() {
  const searchParams = useSearchParams();
  const activeCategory = normalizeCategory(searchParams.get('category'));
  const requestedSubcategory = searchParams.get('subcategory');
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    fetchStoreProducts().then(setAllProducts);
  }, []);

  const activeSubcategory = resolveSubcategorySelection(
    allProducts,
    activeCategory,
    requestedSubcategory,
  );
  const subcategoryTabs = deriveSubcategoryTabs(allProducts, activeCategory);
  const filtered = filterByCategoryAndSubcategory(
    allProducts,
    activeCategory,
    activeSubcategory,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl uppercase tracking-wider text-text">
          {activeCategory === 'all' ? 'Todos Los Productos' : displayCategoryGroup(activeCategory)}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={buildCategoryHref(cat)}
            className={
              activeCategory === cat
                ? 'btn-primary px-4 py-2 text-xs uppercase'
                : 'btn-secondary px-4 py-2 text-xs uppercase'
            }
            aria-current={activeCategory === cat ? 'page' : undefined}
          >
            {cat}
          </a>
        ))}
      </div>

      <CategorySubtabs
        group={activeCategory}
        tabs={subcategoryTabs}
        activeSubcategory={activeSubcategory}
      />

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-text-muted">No hay productos en esta categoria aun.</p>
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
