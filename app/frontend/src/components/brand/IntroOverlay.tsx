'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { MacreatScript } from '@/components/brand/MacreatScript';
import { INTRO_SESSION_KEY, shouldShowIntro } from '@/lib/intro-gate';

export function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDecided, setHasDecided] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!shouldShowIntro(window.sessionStorage.getItem(INTRO_SESSION_KEY))) {
      setHasDecided(true);
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setHasDecided(true);
    setIsVisible(true);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(dismiss, reducedMotion ? 1200 : 2600);

    return () => window.clearTimeout(timeout);
  }, [dismiss]);

  useEffect(() => {
    if (isVisible) {
      skipButtonRef.current?.focus();
      return;
    }

    if (hasDecided && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [hasDecided, isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismiss, isVisible]);

  if (!hasDecided || !isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="La Villa Skateboarding intro"
      className="intro-overlay fixed inset-0 z-[60] flex items-center justify-center bg-villa-black"
    >
      <button
        ref={skipButtonRef}
        type="button"
        onClick={dismiss}
        className="btn-secondary absolute right-4 top-4 z-10 px-3 py-2 text-xs"
      >
        Skip
      </button>

      <div className="intro-credit flex flex-col items-center gap-5">
        <MacreatScript width={96} priority />
        <p className="text-center text-xs uppercase tracking-[0.2em] text-villa-smoke">
          Performance / Developed / Maintained
        </p>
      </div>

      <div className="intro-title absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
        <div className="intro-wordmark">
          <BrandWordmark
            width={560}
            priority
            className="h-auto w-[min(70vw,560px)]"
          />
        </div>
        <p className="font-display text-3xl tracking-[-0.02em] text-villa-bone sm:text-5xl">
          LA VILLA SB
        </p>
      </div>

      <style jsx>{`
        .intro-overlay {
          animation: intro-overlay-exit 0.4s cubic-bezier(0.16, 1, 0.3, 1) 2.2s forwards;
        }

        .intro-credit {
          animation: intro-credit 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-title {
          opacity: 0;
          animation: intro-title 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards;
        }

        .intro-wordmark {
          clip-path: inset(0 100% 0 0);
          animation: intro-wordmark-wipe 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards;
        }

        @keyframes intro-credit {
          0%,
          100% {
            opacity: 0;
          }

          22%,
          72% {
            opacity: 1;
          }
        }

        @keyframes intro-title {
          to {
            opacity: 1;
          }
        }

        @keyframes intro-wordmark-wipe {
          to {
            clip-path: inset(0);
          }
        }

        @keyframes intro-overlay-exit {
          to {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-overlay,
          .intro-credit,
          .intro-title,
          .intro-wordmark {
            animation: none;
          }

          .intro-credit {
            display: none;
          }

          .intro-title {
            opacity: 1;
          }

          .intro-wordmark {
            clip-path: inset(0);
          }
        }
      `}</style>
    </div>
  );
}
