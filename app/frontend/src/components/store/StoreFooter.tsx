'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { INSTAGRAM_URL, WHATSAPP_URL, EXTERNAL_LINK_REL } from '@/lib/site-links';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: INSTAGRAM_URL },
  { label: 'WhatsApp', href: WHATSAPP_URL },
];

const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'Decks', href: '/products?category=decks' },
      { label: 'Apparel', href: '/products?category=apparel' },
      { label: 'Accessories', href: '/products?category=accessories' },
      { label: 'All Products', href: '/products' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/account' },
      { label: 'Shipping Info', href: '/account' },
      { label: 'Returns', href: '/account' },
      { label: 'Size Guide', href: '/account' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/' },
      { label: 'Team', href: '/' },
      { label: 'Events', href: '/' },
      { label: 'Dealers', href: '/' },
      { label: 'Developer', href: 'https://github.com/Macreat', isExternal: true },
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
      const res = await fetch('http://localhost:8010/api/v1/catalog/subscribers', {
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
              La Villa Skateboarding &mdash; The darker side of skateboarding.
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
              Lurk With Us
            </h4>
            <p className="font-sans text-sm text-villa-smoke mb-6">
              Join the mailing list for drops, deals, and skate content.
            </p>
            <form className="flex flex-col gap-2 w-full max-w-md mx-auto" onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-tag" className="sr-only">
                Tag or name
              </label>
              <input
                id="newsletter-tag"
                type="text"
                placeholder="Your tag or name"
                value={subTag}
                onChange={(e) => setSubTag(e.target.value)}
                className="input-field w-full"
                required
              />
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
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
                {subscribing ? 'Joining...' : 'Join'}
              </button>
              {subStatus === 'success' && (
                <p className="text-sm text-villa-slime">You&apos;re in! Welcome to the lurk.</p>
              )}
              {subStatus === 'error' && (
                <p className="text-sm text-villa-blood">Something went wrong. Please try again.</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-villa-smoke/25 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-sans text-xs text-villa-smoke">
            &copy; {new Date().getFullYear()} La Villa Skateboarding. All rights reserved.
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
