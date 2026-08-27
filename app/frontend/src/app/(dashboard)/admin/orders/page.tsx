'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import type { Order } from '@/lib/admin-types';
import { isServiceUnavailable, resolveAdminDataState } from '@/lib/service-state';
import {
  EmptyStatePanel,
  ServiceOfflinePanel,
  SkeletonRows,
} from '@/components/admin/DataStates';
import { RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-accent/10 text-accent',
  confirmed: 'bg-villa-teal/10 text-villa-teal',
  shipped: 'bg-villa-teal/10 text-villa-teal',
  delivered: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-danger/10 text-danger',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setOffline(false);
    setError(null);
    api
      .proxyGet<Order[] | { data?: Order[] }>('cart', 'orders')
      .then((res) => {
        const raw = Array.isArray(res) ? res : (res.data ?? []);
        setOrders(raw);
      })
      .catch((e) => {
        if (isServiceUnavailable(e instanceof ApiError ? e.status : null)) {
          setOffline(true);
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load orders');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const state = resolveAdminDataState({
    loading,
    unavailable: offline,
    itemCount: orders.length,
  });

  return (
    <div>
      <TopBar title="Orders" />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted" aria-live="polite">
            {state === 'loading'
              ? 'Loading orders...'
              : state === 'ready'
                ? `${orders.length} order${orders.length !== 1 ? 's' : ''}`
                : '\u00a0'}
          </p>
          <Button variant="secondary" onClick={fetchOrders} isLoading={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {state === 'loading' ? (
          <SkeletonRows label="Loading orders" />
        ) : state === 'offline' ? (
          <ServiceOfflinePanel
            description="The orders service is not responding right now. Orders will appear here once it is back online."
            onRetry={fetchOrders}
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
              <Button variant="secondary" onClick={fetchOrders}>
                Retry
              </Button>
            </div>
          </Card>
        ) : state === 'empty' ? (
          <EmptyStatePanel
            title="No orders yet"
            description="Orders placed through the storefront will appear here."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <caption className="sr-only">
                Storefront orders with customer, status, total, and date
              </caption>
              <thead>
                <tr className="border-b border-villa-smoke/25">
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Order</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Customer</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Status</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Total</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-villa-smoke/25">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm font-medium tabular-nums text-text">#{order.id}</td>
                    <td className="px-5 py-2.5">
                      <p className="text-sm font-medium text-text">{order.customer_name}</p>
                      <p className="text-xs text-text-muted">{order.customer_phone}</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex rounded-[2px] px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-surface-elevated text-text-muted'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text">${order.total.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
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
