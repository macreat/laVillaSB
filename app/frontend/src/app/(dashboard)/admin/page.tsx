'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

type StatDatum = {
  label: string;
  value: string;
  icon: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
};

type ServiceCheck = () => Promise<unknown>;

const SYSTEM_SERVICES: ReadonlyArray<{ name: string; check: ServiceCheck }> = [
  { name: 'Laravel Gateway', check: () => api.me() },
  { name: 'Catalog Service', check: () => api.proxyGet('catalog', 'health') },
  { name: 'Inventory Service', check: () => api.proxyGet('inventory', 'health') },
  { name: 'Orders Service', check: () => api.proxyGet('cart', 'health') },
  { name: 'Payments Service', check: () => api.proxyGet('payments', 'health') },
  { name: 'Notifications Service', check: () => api.proxyGet('notifications', 'health') },
  { name: 'Users Service', check: () => api.proxyGet('users', 'health') },
];

type OrderSummary = {
  total_orders: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
  orders_yesterday: number;
};

type DashboardOrder = {
  id: number;
  customer_name: string;
  status: string;
  total: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatDatum[]>([
    { label: 'Total Products', value: '—', icon: 'package', change: 'Catalog service pending', changeType: 'neutral' },
    { label: 'Orders', value: '—', icon: 'cart', change: 'Orders service pending', changeType: 'neutral' },
    { label: 'Revenue', value: '—', icon: 'dollar', change: 'Total revenue', changeType: 'neutral' },
    { label: 'Growth', value: '—', icon: 'trending', change: 'vs yesterday', changeType: 'neutral' },
  ]);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[] | null>(null);
  const [topProducts, setTopProducts] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const res = await api.proxyGet<unknown>('catalog', 'products');
        const raw = Array.isArray(res) ? res : (res as { data?: unknown[] }).data ?? [];
        if (!active) return;
        setStats((prev) => [
          { ...prev[0], value: String(raw.length), change: 'Total products', changeType: 'neutral' as const },
          ...prev.slice(1),
        ] as StatDatum[]);
        setTopProducts(
          raw
            .slice(0, 5)
            .map((p) => (p as { name?: string }).name)
            .filter((n): n is string => Boolean(n)),
        );
      } catch {
        if (!active) return;
        setStats((prev) => [
          { ...prev[0], value: 'Unavailable', change: 'Unavailable', changeType: 'neutral' as const },
          ...prev.slice(1),
        ] as StatDatum[]);
        setTopProducts([]);
      }
    };

    const loadOrders = async () => {
      try {
        const res = await api.proxyGet<unknown>('cart', 'orders');
        const raw = Array.isArray(res) ? res : (res as { data?: unknown[] }).data ?? [];
        if (!active) return;
        setRecentOrders(
          raw.slice(0, 3).map((o) => {
            const order = o as DashboardOrder;
            return { id: order.id, customer_name: order.customer_name, status: order.status, total: order.total };
          }),
        );
      } catch {
        if (!active) return;
        setRecentOrders([]);
      }
    };

    const loadSummary = async () => {
      const setRelevant = (patch: (prev: StatDatum[]) => StatDatum[]) => {
        if (!active) return;
        setStats(patch);
      };

      try {
        const s = await api.proxyGet<OrderSummary>('cart', 'orders/summary');
        const growth =
          s.orders_yesterday > 0
            ? Math.round(((s.orders_today - s.orders_yesterday) / s.orders_yesterday) * 100)
            : null;
        setRelevant((prev) => [
          { ...prev[0] },
          { ...prev[1], value: String(s.total_orders), change: 'Total orders', changeType: 'neutral' },
          { ...prev[2], value: `$${s.total_revenue.toFixed(2)}`, change: 'Total revenue', changeType: 'neutral' },
          {
            ...prev[3],
            value: growth !== null ? `${growth >= 0 ? '+' : ''}${growth}%` : 'New',
            change: 'vs yesterday',
            changeType: growth !== null ? (growth >= 0 ? 'positive' : 'negative') : 'neutral',
          },
        ]);
      } catch {
        if (!active) return;
        setRelevant((prev) =>
          prev.map((stat) => ({ ...stat, value: 'Unavailable', change: 'Unavailable', changeType: 'neutral' as const })),
        );
      }
    };

    loadProducts();
    loadOrders();
    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <TopBar title="Dashboard" />

      <div className="p-6">
        <div className="mb-6">
          <h2 className="font-display text-lg tracking-wide text-text-muted">
            OVERVIEW
          </h2>
          <p className="text-sm text-text-muted">
            Welcome to the La Villa Skateboarding admin panel.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 font-display text-lg tracking-wide text-text">
              RECENT ORDERS
            </h3>
            {recentOrders ? (
              recentOrders.length > 0 ? (
                <ul className="divide-y divide-villa-smoke/25">
                  {recentOrders.map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">
                          <span className="tabular-nums">#{order.id}</span> · {order.customer_name}
                        </p>
                        <p className="text-xs capitalize text-text-muted">{order.status}</p>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-text">${order.total.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                  <p className="text-sm text-text-muted">No orders yet.</p>
                </div>
              )
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                <p className="text-sm text-text-muted">Loading orders...</p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-display text-lg tracking-wide text-text">
              TOP PRODUCTS
            </h3>
            {topProducts ? (
              topProducts.length > 0 ? (
                <ol className="divide-y divide-villa-smoke/25">
                  {topProducts.map((name, idx) => (
                    <li key={name} className="flex items-center gap-3 py-2.5">
                      <span className="w-5 shrink-0 text-xs tabular-nums text-text-muted">{idx + 1}</span>
                      <p className="truncate text-sm font-medium text-text">{name}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                  <p className="text-sm text-text-muted">No products yet.</p>
                </div>
              )
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                <p className="text-sm text-text-muted">Loading products...</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6">
          <h3 className="mb-3 font-display text-lg uppercase tracking-wide text-text">
            System Status
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_SERVICES.map((svc) => (
              <ServiceStatus key={svc.name} name={svc.name} check={svc.check} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

type PingState = 'checking' | 'online' | 'offline';

function ServiceStatus({ name, check }: { name: string; check: ServiceCheck }) {
  const [state, setState] = useState<PingState>('checking');

  useEffect(() => {
    let cancelled = false;
    setState('checking');
    check()
      .then(() => {
        if (!cancelled) setState('online');
      })
      .catch(() => {
        if (!cancelled) setState('offline');
      });
    return () => {
      cancelled = true;
    };
  }, [check]);

  const label = state === 'checking' ? 'Checking' : state === 'online' ? 'Online' : 'Offline';
  const textClass =
    state === 'online' ? 'text-green-500' :
    state === 'offline' ? 'text-danger' :
    'text-text-muted';

  return (
    <div className="flex items-center justify-between border border-villa-smoke/25 bg-surface-elevated px-4 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text">
        {name}
      </span>
      <span
        role="status"
        className={`inline-flex items-center gap-2 text-xs font-medium ${textClass}`}
      >
        <span
          aria-hidden="true"
          className={`h-2 w-2 ${
            state === 'online' ? 'bg-green-500' :
            state === 'offline' ? 'bg-danger' :
            'animate-pulse bg-text-muted'
          }`}
        />
        {label}
      </span>
    </div>
  );
}
