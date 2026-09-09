'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import type { Product, InventoryItem } from '@/lib/admin-types';
import { displayCategoryGroup } from '@/lib/store-catalog';
import { isServiceUnavailable, resolveAdminDataState } from '@/lib/service-state';
import {
  EmptyStatePanel,
  ServiceOfflinePanel,
  SkeletonRows,
} from '@/components/admin/DataStates';
import { Check, Pencil, Plus, Search, X } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const fetchProducts = useCallback((search = '') => {
    setLoading(true);
    setOffline(false);
    setError(null);
    const path = search.trim() ? `products?search=${encodeURIComponent(search.trim())}` : 'products';

    Promise.all([
      api.proxyGet<Product[] | { data?: Product[] }>('catalog', path),
      api.proxyGet<InventoryItem[]>('inventory', 'inventory').catch(() => []),
    ])
      .then(([catalogRes, inventoryRes]) => {
        const raw = Array.isArray(catalogRes) ? catalogRes : (catalogRes.data ?? []);
        const normalized = raw.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
          category: item.category ?? 'Sin Categoria',
          sku: item.sku ?? 'N/A',
        }));
        setProducts(normalized);

        const inv = Array.isArray(inventoryRes) ? inventoryRes : [];
        const map: Record<number, number> = {};
        inv.forEach((item) => { map[item.product_id] = item.quantity; });
        setStockMap(map);
      })
      .catch((e) => {
        if (isServiceUnavailable(e instanceof ApiError ? e.status : null)) {
          setOffline(true);
        } else {
          setError(e instanceof Error ? e.message : 'Error al cargar productos');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setPriceDraft(product.price.toFixed(2));
    setPriceError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setPriceDraft('');
    setPriceError(null);
  };

  /**
   * Write the new price straight into the table before the request resolves so
   * the change is visible immediately, then reconcile with what the catalog
   * service returns. A failure restores the previous price.
   */
  const savePrice = async (product: Product) => {
    const parsed = Number(priceDraft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setPriceError('Ingresa un precio valido');
      return;
    }

    const previousPrice = product.price;
    setSavingId(product.id);
    setPriceError(null);
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, price: parsed } : item)),
    );

    try {
      const updated = await api.proxyPut<Product>('catalog', `products/${product.id}`, {
        price: parsed,
      });
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, price: Number(updated.price) } : item,
        ),
      );
      cancelEditing();
    } catch (e) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, price: previousPrice } : item,
        ),
      );
      setPriceError(e instanceof Error ? e.message : 'No se pudo guardar el precio');
    } finally {
      setSavingId(null);
    }
  };

  const state = resolveAdminDataState({
    loading,
    unavailable: offline,
    itemCount: products.length,
  });

  return (
    <div>
      <TopBar title="Productos" />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Buscar por nombre, SKU o ID..."
              aria-label="Buscar productos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Non-interactive on purpose: products enter the catalog through the
              Drive import, so this only labels where they come from. */}
          <span className="inline-flex items-center rounded-[2px] border border-border bg-surface px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-text-muted">
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            Agregar Producto
          </span>
        </div>

        {state === 'loading' ? (
          <SkeletonRows label="Cargando productos" />
        ) : state === 'offline' ? (
          <ServiceOfflinePanel
            description="El servicio de catalogo no esta respondiendo. Los productos apareceran cuando vuelva a estar en linea."
            onRetry={fetchProducts}
          />
        ) : error ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Peticion Fallida
              </p>
              <p aria-live="polite" className="text-sm text-text-muted">
                {error}
              </p>
              <Button variant="secondary" onClick={() => fetchProducts()}>
                Reintentar
              </Button>
            </div>
          </Card>
        ) : state === 'empty' ? (
          <EmptyStatePanel
            title="No hay productos aun"
            description="Los productos agregados desde el servicio de catalogo apareceran aca."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            {/* The actions column pushes the row past the panel on narrow
                screens, so the table scrolls inside the card instead of
                clipping its trailing columns. */}
            <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem]">
              <caption className="sr-only">
                Catalog products with SKU, category, group, price, and status
              </caption>
              <thead>
                <tr className="border-b border-villa-smoke/25">
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">ID</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Nombre</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">SKU</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Categoria</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Grupo</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Precio</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Stock</th>
                  <th scope="col" className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Estado</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-villa-smoke/25">
                {products.map((product) => {
                  const isEditing = editingId === product.id;
                  const isSaving = savingId === product.id;
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-surface-elevated/50">
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums text-text-muted">{product.id}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-text">{product.name}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-text-muted">{product.sku || 'N/A'}</td>
                      <td className="px-4 py-2.5 text-sm text-text-muted">
                        {/* Drive category paths run long; truncate to keep the
                            row one line and expose the full value on hover. */}
                        <span
                          className="block max-w-[11rem] truncate"
                          title={product.category || 'Sin Categoria'}
                        >
                          {product.category || 'Sin Categoria'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-text-muted">{displayCategoryGroup(product.categoryGroup)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm tabular-nums text-text">
                        {isEditing ? (
                          <input
                            className="input-field w-28 py-1 text-right"
                            type="number"
                            step="0.01"
                            min="0"
                            autoFocus
                            aria-label={`Precio de ${product.name}`}
                            value={priceDraft}
                            onChange={(e) => setPriceDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePrice(product);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                          />
                        ) : (
                          `$${product.price.toFixed(2)}`
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm tabular-nums text-text">
                        {stockMap[product.id] ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex rounded-[2px] px-2 py-0.5 text-xs font-medium ${
                          product.active !== false
                            ? 'bg-accent/10 text-accent'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              className="px-2 py-1"
                              isLoading={isSaving}
                              aria-label={`Guardar precio de ${product.name}`}
                              onClick={() => savePrice(product)}
                            >
                              <Check aria-hidden="true" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="px-2 py-1"
                              aria-label="Cancelar edicion"
                              onClick={cancelEditing}
                            >
                              <X aria-hidden="true" className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            className="px-2 py-1"
                            title="Editar precio"
                            aria-label={`Editar precio de ${product.name}`}
                            onClick={() => startEditing(product)}
                          >
                            <Pencil aria-hidden="true" className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            {priceError && (
              <p aria-live="polite" className="border-t border-villa-smoke/25 px-4 py-3 text-sm text-villa-blood">
                {priceError}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
