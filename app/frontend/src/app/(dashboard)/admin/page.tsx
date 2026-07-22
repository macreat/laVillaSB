'use client';

import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';

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
          <h3 className="mb-3 font-display text-lg tracking-wide text-text">
            SYSTEM STATUS
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Laravel Gateway', url: 'http://localhost:8010/api/admin/me' },
              { name: 'Catalog Service', url: 'http://localhost:9002/health' },
              { name: 'Inventory Service', url: 'http://localhost:9003/health' },
            ].map((svc) => (
              <ServiceStatus key={svc.name} name={svc.name} url={svc.url} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ServiceStatus({ name, url }: { name: string; url: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-elevated px-4 py-3">
      <span className="text-sm font-medium text-text">{name}</span>
      <span className="text-xs text-text-muted">Check manually</span>
    </div>
  );
}
