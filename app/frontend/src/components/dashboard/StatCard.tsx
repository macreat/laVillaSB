'use client';

import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  package: <Package className="h-5 w-5" />,
  cart: <ShoppingCart className="h-5 w-5" />,
  dollar: <DollarSign className="h-5 w-5" />,
  trending: <TrendingUp className="h-5 w-5" />,
};

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export function StatCard({ label, value, change, changeType = 'neutral', icon }: StatCardProps) {
  return (
    <Card className="transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-muted">{label}</p>
          <p className="font-display text-3xl tracking-wide text-text">{value}</p>
          {change && (
            <p
              className={clsx(
                'text-xs font-medium',
                changeType === 'positive' && 'text-accent',
                changeType === 'negative' && 'text-danger',
                changeType === 'neutral' && 'text-text-muted',
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="rounded-md bg-accent/10 p-2.5 text-accent">
          {ICON_MAP[icon] || <Package className="h-5 w-5" />}
        </div>
      </div>
    </Card>
  );
}
