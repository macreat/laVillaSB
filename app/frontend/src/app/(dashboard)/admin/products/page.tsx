'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { Product } from '@/lib/admin-types';
import { Package, Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .proxyGet<Product[] | { data?: Product[] }>('catalog', 'products')
      .then((res) => setProducts(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="Products" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search products..."
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Package className="h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-muted">Could not load products</p>
              <p className="text-sm text-text-muted">{error}</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Package className="h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-muted">No products yet</p>
              <p className="text-sm text-text-muted">Products added through the catalog service will appear here.</p>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">SKU</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Category</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Price</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-5 py-4 text-sm font-medium text-text">{product.name}</td>
                    <td className="px-5 py-4 text-sm text-text-muted">{product.sku || '—'}</td>
                    <td className="px-5 py-4 text-sm text-text-muted">{product.category || '—'}</td>
                    <td className="px-5 py-4 text-right text-sm text-text">${product.price.toFixed(2)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
