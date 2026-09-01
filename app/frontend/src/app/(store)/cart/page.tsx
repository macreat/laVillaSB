'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Trash2, Plus, Minus, Check } from 'lucide-react';
import { ProductImage } from '@/components/store/product/ProductImage';
import { buildWhatsAppHref, EXTERNAL_LINK_REL } from '@/lib/site-links';
import { api } from '@/lib/api';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  if (items.length === 0) {
    if (placed) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="font-display text-2xl uppercase tracking-wider text-text">
            Pedido Realizado
          </h1>
          <p className="text-sm text-text-muted">
            Tu WhatsApp se abrio con los detalles del pedido. Lo confirmaremos ahi.
          </p>
          <Link href="/products" className="btn-primary mt-2 px-8 py-3">
            Seguir Comprando
          </Link>
        </div>
      );
    }

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface">
          <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl uppercase tracking-wider text-text">
          Tu Carrito Esta Vacio
        </h1>
        <p className="text-sm text-text-muted">Hora de revisar la tienda.</p>
        <Link href="/products" className="btn-primary mt-2 px-8 py-3">
          Comprar Ahora
        </Link>
      </div>
    );
  }

  const whatsappText = [
    items.map((i) => `${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n'),
    `Total: $${total.toFixed(2)}`,
  ].join('\n\n');

  const handleOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Ingresa tu nombre y telefono para hacer el pedido.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.proxyPost<{ id: number; total: number; status: string }>(
        'cart',
        'orders',
        {
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          items: items.map((i) => ({
            product_id: Number(i.id),
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      );
      const orderText = `New order #${order.id} for ${customerName}:\n${items
        .map((i) => `- ${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
        .join('\n')}\n\nTotal: $${order.total.toFixed(2)}\nPhone: ${customerPhone}`;
      window.open(buildWhatsAppHref(orderText), '_blank', 'noopener,noreferrer');
      clearCart();
      setPlaced(true);
      setCustomerName('');
      setCustomerPhone('');
    } catch {
      setError('No se pudo hacer el pedido. Abriendo WhatsApp con el resumen de tu carrito.');
      window.open(buildWhatsAppHref(whatsappText), '_blank', 'noopener,noreferrer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 font-display text-3xl uppercase tracking-wider text-text">
        Tu Carrito
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="card-elevated flex items-center gap-4 sm:gap-6"
          >
            <ProductImage
              src={item.image}
              alt={item.name}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-surface sm:h-20 sm:w-20"
              fallbackClassName="flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-muted"
              imageClassName="h-full w-full rounded-md object-cover"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.id}`}
                className="text-sm font-bold uppercase tracking-wide text-text hover:text-accent transition-colors"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 font-display text-lg text-text">
                ${item.price.toFixed(2)}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="rounded-md border border-border p-1 text-text-muted hover:bg-surface-elevated hover:text-text transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-text">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="rounded-md border border-border p-1 text-text-muted hover:bg-surface-elevated hover:text-text transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Subtotal + remove */}
            <div className="text-right">
              <p className="font-display text-lg text-text">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="mt-1 text-text-muted hover:text-danger transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted">Subtotal</span>
          <span className="font-display text-2xl text-text">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        {error && <p className="text-sm text-danger">{error}</p>}
        {placed && (
          <p className="text-sm text-green-600">Pedido listo! Tu WhatsApp se abrio con los detalles.</p>
        )}
        <input
          type="text"
          placeholder="Tu nombre"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="tel"
          placeholder="Tu telefono (WhatsApp)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          disabled={submitting || items.length === 0}
          onClick={handleOrder}
          className="btn-primary w-full py-3.5 text-base text-center disabled:opacity-50"
        >
          Pedir Por WhatsApp
        </button>
        <div className="flex gap-3">
          <Link href="/products" className="btn-secondary flex-1 py-3 text-center">
            Seguir Comprando
          </Link>
          <button onClick={clearCart} className="btn-danger px-6 py-3">
            Vaciar
          </button>
        </div>
      </div>
    </div>
  );
}
