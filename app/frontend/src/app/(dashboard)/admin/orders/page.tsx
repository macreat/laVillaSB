'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { Order } from '@/lib/admin-types';
import { ShoppingCart, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-blue-500/10 text-blue-500',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-accent/10 text-accent',
  cancelled: 'bg-danger/10 text-danger',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    api
      .proxyGet<{ data: Order[] }>('cart', 'orders')
      .then((res) => setOrders(res.data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div>
      <TopBar title="Orders" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {loading ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
          <Button variant="secondary" onClick={fetchOrders} isLoading={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-muted">Could not load orders</p>
              <p className="text-sm text-text-muted">{error}</p>
              <Button variant="secondary" onClick={fetchOrders}>Retry</Button>
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-muted">No orders yet</p>
              <p className="text-sm text-text-muted">Orders placed through the storefront will appear here.</p>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Total</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-5 py-4 text-sm font-medium text-text">#{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-text">{order.customer_name}</p>
                      <p className="text-xs text-text-muted">{order.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-surface-elevated text-text-muted'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-text">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right text-sm text-text-muted">
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
