'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import type { InventoryItem } from '@/lib/admin-types';
import { isServiceUnavailable, resolveAdminDataState } from '@/lib/service-state';
import {
  EmptyStatePanel,
  ServiceOfflinePanel,
  SkeletonRows,
} from '@/components/admin/DataStates';
import { AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(() => {
    setLoading(true);
    setOffline(false);
    setError(null);
    api
      .proxyGet<{ data: InventoryItem[] }>('inventory', 'stock')
      .then((res) => setItems(res.data ?? []))
      .catch((e) => {
        if (isServiceUnavailable(e instanceof ApiError ? e.status : null)) {
          setOffline(true);
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load inventory');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const state = resolveAdminDataState({
    loading,
    unavailable: offline,
    itemCount: items.length,
  });
  const ready = state === 'ready';
  const lowStock = items.filter((i) => i.available <= 5);

  return (
    <div>
      <TopBar title="Inventory" />

      <div className="space-y-6 p-6">
        {ready && lowStock.length > 0 && (
          <Card className="border-accent/30 bg-accent/5">
            <div className="flex items-center gap-3">
              <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm font-medium text-text" aria-live="polite">
                {lowStock.length} product{lowStock.length !== 1 ? 's' : ''} with low stock
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-text-muted">Total SKUs</p>
            <p className="mt-1 font-display text-3xl tracking-wide tabular-nums text-text">
              {ready ? items.length : '\u2014'}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-text-muted">Low Stock Items</p>
            <p className="mt-1 font-display text-3xl tracking-wide tabular-nums text-text">
              {ready ? lowStock.length : '\u2014'}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-text-muted">Total Units</p>
            <p className="mt-1 font-display text-3xl tracking-wide tabular-nums text-text">
              {ready ? items.reduce((sum, i) => sum + i.quantity, 0) : '\u2014'}
            </p>
          </Card>
        </div>

        {state === 'loading' ? (
          <SkeletonRows label="Loading inventory" />
        ) : state === 'offline' ? (
          <ServiceOfflinePanel
            description="The inventory service is not responding right now. Stock levels will appear here once it is back online."
            onRetry={fetchStock}
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
              <Button variant="secondary" onClick={fetchStock}>
                Retry
              </Button>
            </div>
          </Card>
        ) : state === 'empty' ? (
          <EmptyStatePanel
            title="No inventory data"
            description="Stock levels synced from the inventory service will appear here."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <caption className="sr-only">
                Inventory stock levels with on-hand, reserved, and available units per SKU
              </caption>
              <thead>
                <tr className="border-b border-villa-smoke/25">
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">SKU</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Product</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">On Hand</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Reserved</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-villa-smoke/25">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm font-medium text-text">{item.sku}</td>
                    <td className="px-5 py-2.5 text-sm text-text-muted">{item.product_name || '\u2014'}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text">{item.quantity}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text-muted">{item.reserved}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right">
                      <span className={`text-sm font-medium tabular-nums ${
                        item.available <= 0 ? 'text-danger' : 'text-accent'
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
