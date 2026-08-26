'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import type { Product } from '@/lib/admin-types';
import { displayCategoryGroup } from '@/lib/store-catalog';
import { isServiceUnavailable, resolveAdminDataState } from '@/lib/service-state';
import {
  EmptyStatePanel,
  ServiceOfflinePanel,
  SkeletonRows,
} from '@/components/admin/DataStates';
import { Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setOffline(false);
    setError(null);
    api
      .proxyGet<Product[] | { data?: Product[] }>('catalog', 'products')
      .then((res) => {
        const raw = Array.isArray(res) ? res : (res.data ?? []);
        const normalized = raw.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
          category: item.category ?? 'Uncategorized',
          sku: item.sku ?? 'N/A',
        }));
        setProducts(normalized);
      })
      .catch((e) => {
        if (isServiceUnavailable(e instanceof ApiError ? e.status : null)) {
          setOffline(true);
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load products');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const state = resolveAdminDataState({
    loading,
    unavailable: offline,
    itemCount: products.length,
  });

  return (
    <div>
      <TopBar title="Products" />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search products..."
              aria-label="Search products"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {state === 'loading' ? (
          <SkeletonRows label="Loading products" />
        ) : state === 'offline' ? (
          <ServiceOfflinePanel
            description="The catalog service is not responding right now. Products will appear here once it is back online."
            onRetry={fetchProducts}
          />
        ) : error ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Request Failed
              </p>
              <p aria-live="polite" className="text-sm text-text-muted">
                {error}
              </p>
              <Button variant="secondary" onClick={fetchProducts}>
                Retry
              </Button>
            </div>
          </Card>
        ) : state === 'empty' ? (
          <EmptyStatePanel
            title="No products yet"
            description="Products added through the catalog service will appear here."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <caption className="sr-only">
                Catalog products with SKU, category, group, price, and status
              </caption>
              <thead>
                <tr className="border-b border-villa-smoke/25">
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Name</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">SKU</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Category</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Group</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Price</th>
                  <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-villa-smoke/25">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-5 py-2.5 text-sm font-medium text-text">{product.name}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm text-text-muted">{product.sku || 'N/A'}</td>
                    <td className="px-5 py-2.5 text-sm text-text-muted">{product.category || 'Uncategorized'}</td>
                    <td className="px-5 py-2.5 text-sm text-text-muted">{displayCategoryGroup(product.categoryGroup)}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text">${product.price.toFixed(2)}</td>
                    <td className="px-5 py-2.5 text-center">
                      <span className={`inline-flex rounded-[2px] px-2 py-0.5 text-xs font-medium ${
                        product.active !== false
                          ? 'bg-accent/10 text-accent'
                          : 'bg-surface-elevated text-text-muted'
                      }`}>
                        {product.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
