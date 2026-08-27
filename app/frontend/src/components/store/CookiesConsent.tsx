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

  if (!show) return null;

  return (
    <div className="cookies-consent fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="relative bg-surface-elevated border border-border max-w-[264px] w-full p-3 shadow-2xl flex flex-col items-center text-center space-y-2 rounded-lg">
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
            Performance, Created, Designed
          </p>
          <p className="text-[9px] text-text-muted/60 mt-1 tracking-widest uppercase">
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
          animation: cookies-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cookies-slide-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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