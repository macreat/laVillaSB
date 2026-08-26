'use client';

import { useState, useEffect } from 'react';
import { MacreatScript } from '@/components/brand/MacreatScript';

export function CookiesConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('lavilla_cookies_accepted');
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('lavilla_cookies_accepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookies-consent fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-surface-elevated border border-border max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
        <MacreatScript width={120} />
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase">
            Performance · Created · Designed
          </p>
          <p className="text-[10px] text-text-muted/60 mt-1.5 tracking-widest uppercase">
            Macreat
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="btn-primary w-full mt-2 py-2.5 text-xs"
        >
          Accept
        </button>
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
