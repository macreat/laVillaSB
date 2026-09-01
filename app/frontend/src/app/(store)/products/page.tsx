'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { CategorySubtabs } from '@/components/store/CategorySubtabs';
import { NLSearchBar } from '@/components/store/NLSearchBar';
import { ProductCard } from '@/components/store/product/ProductCard';
import {
  buildCategoryHref,
  CATEGORIES,
  deriveSubcategoryTabs,
  displayCategoryGroup,
  displaySubcategory,
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
  const [nlResults, setNlResults] = useState<StoreProduct[] | null>(null);
  const [nlLoading, setNlLoading] = useState(false);

  useEffect(() => {
    fetchStoreProducts().then(setAllProducts);
  }, []);

  const handleNlResults = useCallback((products: StoreProduct[] | null) => {
    setNlResults(products);
  }, []);

  const handleNlLoading = useCallback((loading: boolean) => {
    setNlLoading(loading);
  }, []);

  const activeSubcategory = resolveSubcategorySelection(
    allProducts,
    activeCategory,
    requestedSubcategory,
  );
  const subcategoryTabs = deriveSubcategoryTabs(allProducts, activeCategory);
  const categoryFiltered = filterByCategoryAndSubcategory(
    allProducts,
    activeCategory,
    activeSubcategory,
  );

  // NL search results override category filtering when active
  const isNlActive = nlResults !== null;
  const filtered = isNlActive ? nlResults : categoryFiltered;

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

      {/* NL Search Bar */}
      <div className="mb-8">
        <NLSearchBar onResults={handleNlResults} onLoading={handleNlLoading} />
      </div>

      {/* Category filters - hidden during NL search */}
      {!isNlActive && (
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
              {displayCategoryGroup(cat)}
            </a>
          ))}
        </div>
      )}

      {!isNlActive && (
        <CategorySubtabs
          group={activeCategory}
          tabs={subcategoryTabs}
          activeSubcategory={activeSubcategory}
        />
      )}

      {/* NL search active indicator */}
      {isNlActive && (
        <div className="mb-6 text-center">
          <button
            onClick={() => setNlResults(null)}
            className="text-xs text-villa-fox underline underline-offset-4 hover:text-villa-bone transition-colors"
          >
            Limpiar busqueda y ver todos los productos
          </button>
        </div>
      )}

      {/* Product grid */}
      {nlLoading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-villa-fox border-t-transparent" />
          <p className="mt-4 text-sm text-villa-smoke/60">Buscando...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-text-muted">
            {isNlActive
              ? 'No se encontraron productos para esa busqueda. Intenta con otros terminos.'
              : 'No hay productos en esta categoria aun.'}
          </p>
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
