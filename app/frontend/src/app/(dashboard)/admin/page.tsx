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
  { name: 'Notifications Service', check: () => api.proxyGet('notifications', 'health') },
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

type Subscriber = {
  id: number;
  email: string;
  tag: string;
  created_at: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatDatum[]>([
    { label: 'Total Productos', value: '—', icon: 'package', change: 'Servicio de catalogo pendiente', changeType: 'neutral' },
    { label: 'Pedidos', value: '—', icon: 'cart', change: 'Servicio de pedidos pendiente', changeType: 'neutral' },
    { label: 'Ingresos', value: '—', icon: 'dollar', change: 'Ingresos totales', changeType: 'neutral' },
    { label: 'Crecimiento', value: '—', icon: 'trending', change: 'vs ayer', changeType: 'neutral' },
  ]);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[] | null>(null);
  const [topProducts, setTopProducts] = useState<string[] | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const res = await api.proxyGet<unknown>('catalog', 'products');
        const raw = Array.isArray(res) ? res : (res as { data?: unknown[] }).data ?? [];
        if (!active) return;
        setStats((prev) => [
          { ...prev[0], value: String(raw.length), change: 'Productos totales', changeType: 'neutral' as const },
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
          { ...prev[0], value: 'No disponible', change: 'No disponible', changeType: 'neutral' as const },
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
          { ...prev[1], value: String(s.total_orders), change: 'Pedidos totales', changeType: 'neutral' },
          { ...prev[2], value: `$${s.total_revenue.toFixed(2)}`, change: 'Ingresos totales', changeType: 'neutral' },
          {
            ...prev[3],
            value: growth !== null ? `${growth >= 0 ? '+' : ''}${growth}%` : 'Nuevo',
            change: 'vs ayer',
            changeType: growth !== null ? (growth >= 0 ? 'positive' : 'negative') : 'neutral',
          },
        ]);
      } catch {
        if (!active) return;
        setRelevant((prev) =>
          prev.map((stat) => ({ ...stat, value: 'No disponible', change: 'No disponible', changeType: 'neutral' as const })),
        );
      }
    };

    loadProducts();
    loadOrders();
    loadSummary();

    const loadSubscribers = async () => {
      try {
        const res = await api.proxyGet<unknown>('catalog', 'subscribers');
        const raw = Array.isArray(res) ? res : [];
        if (!active) return;
        setSubscribers(raw as Subscriber[]);
        setSubscriberCount(raw.length);
      } catch {
        if (!active) return;
        setSubscribers([]);
      }
    };
    loadSubscribers();

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
            RESUMEN
          </h2>
          <p className="text-sm text-text-muted">
            Bienvenido al panel de admin de La Villa Skateboarding.
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
              PEDIDOS RECIENTES
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
                  <p className="text-sm text-text-muted">No hay pedidos aun.</p>
                </div>
              )
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                <p className="text-sm text-text-muted">Cargando pedidos...</p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-display text-lg tracking-wide text-text">
              PRODUCTOS TOP
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
                  <p className="text-sm text-text-muted">No hay productos aun.</p>
                </div>
              )
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                <p className="text-sm text-text-muted">Cargando productos...</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg tracking-wide text-text">
              SUSCRIPTORES
            </h3>
            <span className="text-xs text-text-muted">{subscriberCount} total</span>
          </div>
          {subscribers !== null ? (
            subscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-villa-smoke/25">
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Etiqueta</th>
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Correo</th>
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-villa-smoke/25">
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="py-2 font-medium text-text">{sub.tag}</td>
                        <td className="py-2 text-text-muted">{sub.email}</td>
                        <td className="py-2 text-text-muted text-xs">{new Date(sub.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-border">
                <p className="text-sm text-text-muted">No hay suscriptores aun.</p>
              </div>
            )
          ) : (
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-text-muted">Cargando suscriptores...</p>
            </div>
          )}
        </Card>

        <Card className="mt-6">
          <h3 className="mb-3 font-display text-lg uppercase tracking-wide text-text">
            Estado Del Sistema
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

  const label = state === 'checking' ? 'Verificando' : state === 'online' ? 'En linea' : 'Fuera de linea';
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
