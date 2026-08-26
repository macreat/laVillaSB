'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

const STATS = [
  {
    label: 'Total Products',
    value: '—',
    icon: 'package',
    change: 'Catalog service pending',
    changeType: 'neutral' as const,
  },
  {
    label: 'Orders',
    value: '—',
    icon: 'cart',
    change: 'Orders service pending',
    changeType: 'neutral' as const,
  },
  {
    label: 'Revenue',
    value: '$0',
    icon: 'dollar',
    change: 'No data yet',
    changeType: 'neutral' as const,
  },
  {
    label: 'Growth',
    value: '0%',
    icon: 'trending',
    change: 'Awaiting data',
    changeType: 'neutral' as const,
  },
];

type ServiceCheck = () => Promise<unknown>;

const SYSTEM_SERVICES: ReadonlyArray<{ name: string; check: ServiceCheck }> = [
  { name: 'Laravel Gateway', check: () => api.me() },
  { name: 'Catalog Service', check: () => api.proxyGet('catalog', 'health') },
  { name: 'Inventory Service', check: () => api.proxyGet('inventory', 'health') },
];

export default function DashboardPage() {
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
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 font-display text-lg tracking-wide text-text">
              RECENT ORDERS
            </h3>
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-text-muted">
                No orders yet — connect the orders service to populate this view.
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-display text-lg tracking-wide text-text">
              TOP PRODUCTS
            </h3>
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-text-muted">
                No products yet — connect the catalog service to populate this view.
              </p>
            </div>
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
