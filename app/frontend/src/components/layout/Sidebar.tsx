'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react';
import { FoxMark } from '@/components/brand/FoxMark';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Panel', href: '/admin', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Inventario', href: '/admin/inventory', icon: Warehouse },
  { label: 'Configuracion', href: '/admin/settings', icon: Settings },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    }, 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/70 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={() => onClose()}
      />
      <aside
        ref={drawerRef}
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : 'invisible -translate-x-full lg:visible',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <FoxMark size={28} white />
            <span className="font-display text-xl uppercase tracking-wide text-text">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver tienda"
              className="flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-surface-elevated hover:text-accent"
            >
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
              Ver Tienda
            </a>
            <button
              type="button"
              onClick={() => onClose()}
              aria-label="Cerrar navegacion"
              className="rounded-[2px] p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text lg:hidden"
            >
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    aria-current={isActive ? 'page' : undefined}
                    className={clsx(
                      'flex h-10 items-center gap-3 border-l-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
                      isActive
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-transparent text-text-muted hover:bg-surface-elevated hover:text-text',
                    )}
                  >
                    <item.icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-villa-smoke/25 p-3">
          <p className="px-3 py-2 text-[11px] text-text-muted/60">admin@lavillasb.com</p>
          <button
            type="button"
            onClick={() => logout()}
            className="flex h-10 w-full items-center gap-3 border-l-2 border-transparent px-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-danger"
          >
            <LogOut aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            Cerrar Sesion
          </button>
        </div>
      </aside>
    </>
  );
}
