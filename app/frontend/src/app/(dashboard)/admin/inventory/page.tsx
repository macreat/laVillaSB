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
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchStock = useCallback(() => {
    setLoading(true);
    setOffline(false);
    setError(null);
    api
      .proxyGet<InventoryItem[] | { data?: InventoryItem[] }>('inventory', 'inventory')
      .then((res) => {
        const raw = Array.isArray(res) ? res : (res.data ?? []);
        setItems(raw);
      })
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
  const lowStock = items.filter((i) => i.is_low_stock);

  const handleSave = async (productId: number) => {
    const raw = drafts[productId];
    if (raw === undefined) return;
    const qty = Number(raw);
    if (Number.isNaN(qty) || qty < 0) return;
    setSavingId(productId);
    try {
      const updated = await api.proxyPut<InventoryItem>('inventory', String(productId), {
        quantity: qty,
      });
      setItems((prev) => prev.map((i) => (i.product_id === productId ? updated : i)));
      setDrafts((d) => {
        const next = { ...d };
        delete next[productId];
        return next;
      });
    } catch {
      setError('Failed to update stock. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

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
                Inventory stock levels with quantity, threshold, and low-stock status per product
              </caption>
              <thead>
                <tr className="border-b border-villa-smoke/25">
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Product ID</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">SKU</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Quantity</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Low Stock Threshold</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Status</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-villa-smoke/25">
                {items.map((item) => (
                  <tr key={item.product_id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm font-medium text-text">{item.product_id}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm font-medium text-text-muted">{item.sku || '\u2014'}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={drafts[item.product_id] ?? String(item.quantity)}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [item.product_id]: e.target.value }))
                        }
                        aria-label={`Edit quantity for product ${item.product_id}`}
                        className="w-20 rounded border border-border bg-surface px-2 py-1 text-right text-sm tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text-muted">{item.low_stock_threshold}</td>
                    <td className="whitespace-nowrap px-5 py-2.5">
                      <span className={`inline-flex rounded-[2px] px-2 py-0.5 text-xs font-medium ${
                        item.is_low_stock ? 'bg-danger/10 text-danger' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {item.is_low_stock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right">
                      <button
                        onClick={() => handleSave(item.product_id)}
                        disabled={savingId === item.product_id}
                        className="rounded border border-border px-3 py-1 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        {savingId === item.product_id ? 'Saving...' : 'Save'}
                      </button>
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
