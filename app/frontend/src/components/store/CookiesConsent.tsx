'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import brandManifest from '@/lib/brand-manifest.json';

export function CookiesConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('lavilla_cookies_accepted');
    if (!accepted) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        localStorage.setItem('lavilla_cookies_accepted', 'true');
        setShow(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [show]);

  if (!show) return null;

  return (
    <div className="cookies-consent fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-surface-elevated border border-border w-[min(90vw,300px)] p-4 shadow-2xl rounded-lg flex flex-col items-center text-center space-y-3">
        <button
          onClick={() => {
            localStorage.setItem('lavilla_cookies_accepted', 'true');
            setShow(false);
          }}
          aria-label="Close"
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border hover:text-text"
        >
          <X size={14} />
        </button>
        <Image
          src={brandManifest.logoOG.src}
          width={brandManifest.logoOG.width}
          height={brandManifest.logoOG.height}
          alt="La Villa Skateboarding"
          className="w-10 h-10 object-contain"
          priority
        />
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-text-muted uppercase">
            Performance, Designed and Maintained
          </p>
          <p className="text-[9px] text-text-muted/60 mt-1 uppercase">
            by Macreat
          </p>
        </div>
        <Image
          src={brandManifest.macreat.src}
          width={64}
          height={Math.round((64 * brandManifest.macreat.height) / brandManifest.macreat.width)}
          alt="Macreat"
          className="object-contain"
        />
      </div>

      <style jsx>{`
        .cookies-consent {
          animation: cookies-pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cookies-pop-in {
          from {
            transform: scale(0.96);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cookies-consent {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}