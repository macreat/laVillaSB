'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { INSTAGRAM_URL, WHATSAPP_URL, EXTERNAL_LINK_REL } from '@/lib/site-links';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8010';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: INSTAGRAM_URL },
  { label: 'WhatsApp', href: WHATSAPP_URL },
];

const FOOTER_LINKS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Tablas', href: '/products?category=decks' },
      { label: 'Ropa', href: '/products?category=apparel' },
      { label: 'Accesorios', href: '/products?category=accessories' },
      { label: 'Todos Los Productos', href: '/products' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Contacto', href: '/account' },
      { label: 'Envios', href: '/account' },
      { label: 'Devoluciones', href: '/account' },
      { label: 'Guia De Talles', href: '/account' },
    ],
  },
  {
    title: 'Compania',
    links: [
      { label: 'Nosotros', href: '/' },
      { label: 'Equipo', href: '/' },
      { label: 'Eventos', href: '/' },
      { label: 'Distribuidores', href: '/' },
      { label: 'Desarrollador', href: 'https://github.com/Macreat', isExternal: true },
    ],
  },
];

export function StoreFooter() {
  const [subTag, setSubTag] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subStatus, setSubStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setSubStatus('idle');
    try {
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8010';

// ... inside the component:
      const res = await fetch(`${API_BASE}/api/v1/catalog/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, tag: subTag }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to subscribe');
      }
      setSubStatus('success');
      setSubEmail('');
      setSubTag('');
    } catch {
      setSubStatus('error');
    } finally {
      setSubscribing(false);
    }
  };
  return (
    <footer className="bg-villa-black border-t border-villa-smoke/25">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:gap-x-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="mb-6 block w-fit">
              <BrandWordmark width={160} />
            </Link>
            <p className="font-sans text-sm text-villa-smoke leading-relaxed max-w-xs">
              La Villa Skateboarding - La villa es la ley.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-display text-sm uppercase tracking-[0.15em] text-villa-bone">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'isExternal' in link && link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel={EXTERNAL_LINK_REL}
                        className="font-sans text-sm text-villa-smoke hover:text-villa-fox transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-sm text-villa-smoke hover:text-villa-fox transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 border-t border-villa-smoke/25 pt-12">
          <div className="mx-auto max-w-lg text-center">
            <h4 className="font-display text-2xl uppercase tracking-wider text-villa-bone mb-3">
              Unite A La Manada
            </h4>
            <p className="font-sans text-sm text-villa-smoke mb-6">
              Unite a la lista para drops, ofertas y contenido de skate.
            </p>
            <form className="flex flex-col gap-2 w-full max-w-md mx-auto" onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-tag" className="sr-only">
                Etiqueta o nombre
              </label>
              <input
                id="newsletter-tag"
                type="text"
                placeholder="Tu etiqueta o nombre"
                value={subTag}
                onChange={(e) => setSubTag(e.target.value)}
                className="input-field w-full"
                required
              />
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electronico
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                className="input-field w-full"
                required
              />
              <button 
                type="submit" 
                className="btn-secondary"
                disabled={subscribing}
              >
                {subscribing ? 'Uniendo...' : 'Unirme'}
              </button>
              {subStatus === 'success' && (
                <p className="text-sm text-villa-slime">Listo! Bienvenido a la manada.</p>
              )}
              {subStatus === 'error' && (
                <p className="text-sm text-villa-blood">Algo salio mal. Intenta de nuevo.</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-villa-smoke/25 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-sans text-xs text-villa-smoke">
            &copy; {new Date().getFullYear()} La Villa Skateboarding. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                aria-label={`La Villa Skateboarding on ${social.label}`}
                className="font-sans text-xs font-semibold uppercase tracking-wider text-villa-smoke hover:text-villa-fox cursor-pointer transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
