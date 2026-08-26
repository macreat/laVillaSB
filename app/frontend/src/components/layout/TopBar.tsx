'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminChrome } from '@/components/layout/AdminChrome';

export function TopBar({ title }: { title: string }) {
  const { user } = useAuth();
  const { navOpen, openNav } = useAdminChrome();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-villa-smoke/25 bg-bg/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openNav}
          aria-expanded={navOpen}
          aria-controls="admin-sidebar"
          aria-label="Open navigation"
          className="-ml-1 rounded-[2px] p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-display text-xl uppercase tracking-wide text-text sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
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
