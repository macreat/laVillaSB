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
import { Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', category: '', stock: '12' });
  const [creating, setCreating] = useState(false);

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

  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) return;
    setCreating(true);
    try {
      const created = await api.proxyPost<Product>('catalog', 'products', {
        name: newProduct.name.trim(),
        sku: newProduct.sku.trim() || undefined,
        price: parseFloat(newProduct.price) || 0,
        active: true,
      });

      const stockQty = parseInt(newProduct.stock) || 12;
      await api.proxyPut('inventory', `inventory/${created.id}`, { quantity: stockQty });

      setShowAddModal(false);
      setNewProduct({ name: '', sku: '', price: '', category: '', stock: '12' });
      fetchProducts(searchQuery);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear producto');
    } finally {
      setCreating(false);
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
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
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
            <table className="w-full">
              <caption className="sr-only">
                Catalog products with SKU, category, group, price, and status
              </caption>
              <thead>
                <tr className="border-b border-villa-smoke/25">
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">ID</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Nombre</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">SKU</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Categoria</th>
                  <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Grupo</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Precio</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Stock</th>
                  <th scope="col" className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-villa-smoke/25">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm tabular-nums text-text-muted">{product.id}</td>
                    <td className="px-5 py-2.5 text-sm font-medium text-text">{product.name}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-sm text-text-muted">{product.sku || 'N/A'}</td>
                    <td className="px-5 py-2.5 text-sm text-text-muted">{product.category || 'Sin Categoria'}</td>
                    <td className="px-5 py-2.5 text-sm text-text-muted">{displayCategoryGroup(product.categoryGroup)}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text">${product.price.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right text-sm tabular-nums text-text">
                      {stockMap[product.id] ?? '—'}
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      <span className={`inline-flex rounded-[2px] px-2 py-0.5 text-xs font-medium ${
                        product.active !== false
                          ? 'bg-accent/10 text-accent'
                          : 'bg-surface-elevated text-text-muted'
                      }`}>
                        {product.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md space-y-4 p-6">
            <h2 className="text-lg font-semibold text-text">Agregar Nuevo Producto</h2>
            <input
              className="input-field w-full"
              placeholder="Nombre del producto *"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              className="input-field w-full"
              placeholder="SKU (opcional)"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
            />
            <input
              className="input-field w-full"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input
              className="input-field w-full"
              placeholder="Stock inicial"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateProduct} disabled={creating || !newProduct.name.trim()}>
                {creating ? 'Creando...' : 'Crear Producto'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
