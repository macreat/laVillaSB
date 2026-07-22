'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import type { InventoryItem } from '@/lib/admin-types';
import { Warehouse, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .proxyGet<{ data: InventoryItem[] }>('inventory', 'stock')
      .then((res) => setItems(res.data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const lowStock = items.filter((i) => i.available <= 5);

  return (
    <div>
      <TopBar title="Inventory" />

      <div className="p-6 space-y-6">
        {!loading && !error && lowStock.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
              <p className="text-sm font-medium text-text">
                {lowStock.length} product{lowStock.length !== 1 ? 's' : ''} with low stock
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-text-muted">Total SKUs</p>
            <p className="mt-1 font-display text-3xl tracking-wide text-text">
              {loading ? '...' : items.length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-text-muted">Low Stock Items</p>
            <p className="mt-1 font-display text-3xl tracking-wide text-text">
              {loading ? '...' : lowStock.length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-text-muted">Total Units</p>
            <p className="mt-1 font-display text-3xl tracking-wide text-text">
              {loading ? '...' : items.reduce((sum, i) => sum + i.quantity, 0)}
            </p>
          </Card>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Warehouse className="h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-muted">Could not load inventory</p>
              <p className="text-sm text-text-muted">{error}</p>
            </div>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Warehouse className="h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-muted">No inventory data</p>
              <p className="text-sm text-text-muted">Stock levels synced from the inventory service will appear here.</p>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">SKU</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Product</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">On Hand</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Reserved</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-5 py-4 text-sm font-medium text-text">{item.sku}</td>
                    <td className="px-5 py-4 text-sm text-text-muted">{item.product_name || '—'}</td>
                    <td className="px-5 py-4 text-right text-sm text-text">{item.quantity}</td>
                    <td className="px-5 py-4 text-right text-sm text-text-muted">{item.reserved}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-sm font-medium ${
                        item.available <= 0 ? 'text-danger' :
                        item.available <= 5 ? 'text-yellow-500' :
                        'text-accent'
                      }`}>
                        {item.available}
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
