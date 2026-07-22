'use client';

import { useAuth } from '@/hooks/useAuth';
import { Bell } from 'lucide-react';

export function TopBar({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-6 backdrop-blur-sm">
      <h1 className="font-display text-2xl tracking-wide text-text">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-accent">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-text">{user?.name || 'Admin'}</p>
            <p className="text-xs text-text-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
