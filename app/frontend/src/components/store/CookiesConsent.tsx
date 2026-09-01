'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Settings } from 'lucide-react';
import brandManifest from '@/lib/brand-manifest.json';
import { Button } from '@/components/ui/Button';

type CookieCategory = 'necessary' | 'analytics' | 'functional' | 'marketing';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'lavilla_cookie_preferences';
const CONSENT_VERSION = '1.0';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

function loadPreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed.preferences;
  } catch {
    return null;
  }
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: CONSENT_VERSION, preferences: prefs, timestamp: Date.now() })
  );
}

export function CookiesConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(true);

  useEffect(() => {
    const stored = loadPreferences();
    if (stored) {
      setPreferences(stored);
      setHasConsented(true);
    } else {
      setHasConsented(false);
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setPreferences(allAccepted);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setPreferences(onlyNecessary);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    savePreferences(preferences);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [preferences]);

  const handleToggleCategory = useCallback((category: CookieCategory) => {
    if (category === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const handleReopenPreferences = useCallback(() => {
    const stored = loadPreferences();
    if (stored) setPreferences(stored);
    setShowPreferences(true);
  }, []);

  if (hasConsented && !showPreferences) return null;

  return (
    <>
      {/* Cookie Banner - Centered card */}
      {showBanner && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
        >
          {/* Subtle backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Cookie Card */}
          <div className="cookie-banner relative bg-[#0a0f1a] border border-[#1a2540] w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            {/* Header with logo */}
            <div className="flex items-center justify-center p-6 pb-4">
              <Image
                src={brandManifest.logoOG.src}
                width={brandManifest.logoOG.width}
                height={brandManifest.logoOG.height}
                alt="La Villa Skateboarding"
                className="w-32 h-32 object-contain"
                priority
              />
            </div>

            {/* Content */}
            <div className="px-6 pb-4 text-center">
              <p className="text-[11px] text-[#8899bb] leading-relaxed">
                We use cookies to enhance your shopping experience, analyze traffic, and personalize content.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-4 flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={handleAcceptAll}
                className="w-full text-xs py-2.5"
              >
                Accept All
              </Button>
              <Button
                variant="secondary"
                onClick={handleRejectNonEssential}
                className="w-full text-xs py-2"
              >
                Reject Non-Essential
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowPreferences(true)}
                className="w-full text-xs py-2"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Preferences
              </Button>
            </div>

            {/* Attribution */}
            <div className="border-t border-[#1a2540] px-4 py-3 flex flex-col items-center gap-1.5 bg-[#080c16]">
              <span className="text-[9px] font-medium tracking-wide text-[#556688] uppercase">
                Designed & Maintained by
              </span>
              <Image
                src={brandManifest.macreat.src}
                width={108}
                height={Math.round((108 * brandManifest.macreat.height) / brandManifest.macreat.width)}
                alt="Macreat"
                className="object-contain opacity-50"
              />
            </div>
          </div>

          <style jsx>{`
            .cookie-banner {
              animation: cookie-pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            @keyframes cookie-pop-in {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .cookie-banner {
                animation: none;
              }
            }
          `}</style>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie preferences"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPreferences(false)}
          />

          <div className="cookie-preferences relative w-full max-w-md bg-[#0a0f1a] border border-[#1a2540] rounded-lg shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a2540]">
              <div className="flex items-center gap-3">
                <Image
                  src={brandManifest.logoOG.src}
                  width={brandManifest.logoOG.width}
                  height={brandManifest.logoOG.height}
                  alt="La Villa Skateboarding"
                  className="w-8 h-8 object-contain"
                />
                <h2 className="text-sm font-semibold text-[#e9eef8]">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#8899bb] transition-colors hover:bg-[#1a2540] hover:text-[#e9eef8]"
                aria-label="Close preferences"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-[11px] text-[#8899bb] mb-4">
                Choose which cookies you want to allow.
              </p>

              <CookieCategoryCard
                title="Necessary"
                description="Essential for the website to function. Cannot be disabled."
                enabled={true}
                locked={true}
                onToggle={() => {}}
              />

              <CookieCategoryCard
                title="Analytics"
                description="Help us understand how visitors interact with our website."
                enabled={preferences.analytics}
                locked={false}
                onToggle={() => handleToggleCategory('analytics')}
              />

              <CookieCategoryCard
                title="Functional"
                description="Enable personalized features like remembering preferences."
                enabled={preferences.functional}
                locked={false}
                onToggle={() => handleToggleCategory('functional')}
              />

              <CookieCategoryCard
                title="Marketing"
                description="Used for displaying relevant advertisements."
                enabled={preferences.marketing}
                locked={false}
                onToggle={() => handleToggleCategory('marketing')}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-[#1a2540] p-4 flex gap-2">
              <Button
                variant="primary"
                onClick={handleSavePreferences}
                className="flex-1 text-xs"
              >
                Save Preferences
              </Button>
              <Button
                variant="secondary"
                onClick={handleAcceptAll}
                className="flex-1 text-xs"
              >
                Accept All
              </Button>
            </div>

            {/* Attribution */}
            <div className="border-t border-border/50 px-4 py-2 flex items-center justify-center gap-2 bg-surface/50">
              <span className="text-[9px] font-medium tracking-wide text-text-muted/50 uppercase">
                Designed & Maintained by Macreat
              </span>
            </div>
          </div>

          <style jsx>{`
            .cookie-preferences {
              animation: cookie-panel-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            @keyframes cookie-panel-pop {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .cookie-preferences {
                animation: none;
              }
            }
          `}</style>
        </div>
      )}

      {/* Reopen Button */}
      {hasConsented && !showBanner && !showPreferences && (
        <button
          onClick={handleReopenPreferences}
          className="fixed bottom-4 left-4 z-[55] flex items-center gap-2 px-3 py-2 bg-[#0a0f1a] border border-[#1a2540] rounded-full shadow-lg text-[#8899bb] hover:text-[#e9eef8] hover:bg-[#1a2540] transition-colors"
          aria-label="Manage cookie preferences"
          title="Cookie Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </>
  );
}

function CookieCategoryCard({
  title,
  description,
  enabled,
  locked,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-[#0d1424] border border-[#1a2540] rounded-md p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-[#e9eef8]">{title}</h3>
          <p className="text-[10px] text-[#8899bb] mt-0.5 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={onToggle}
          disabled={locked}
          className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${
            locked
              ? 'bg-[#3a5580] cursor-not-allowed'
              : enabled
              ? 'bg-[#4f83f1]'
              : 'bg-[#1a2540]'
          }`}
          role="switch"
          aria-checked={enabled}
          aria-label={`${title} cookies`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {locked && (
        <span className="inline-block mt-1.5 text-[9px] font-medium tracking-wide text-[#4f83f1]/70 uppercase">
          Always Active
        </span>
      )}
    </div>
  );
}
