'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { fetchNLSearch, type StoreProduct } from '@/lib/store-catalog';

interface NLSearchBarProps {
  onResults: (products: StoreProduct[] | null) => void;
  onLoading: (loading: boolean) => void;
}

export function NLSearchBar({ onResults, onLoading }: NLSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        onResults(null);
        onLoading(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      onLoading(true);
      try {
        const results = await fetchNLSearch(trimmed);
        onResults(results);
      } catch {
        onResults(null);
      } finally {
        onLoading(false);
        setIsSearching(false);
      }
    },
    [onResults, onLoading],
  );

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (!value.trim()) {
        onResults(null);
        onLoading(false);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      onLoading(true);
      debounceRef.current = setTimeout(() => doSearch(value), 500);
    },
    [doSearch, onResults, onLoading],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onResults(null);
    onLoading(false);
    setIsSearching(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    inputRef.current?.focus();
  }, [onResults, onLoading]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      doSearch(query);
    },
    [query, doSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-villa-smoke/60"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Busca lo que quieras... ej: tenis nike negros talla 9"
          className="w-full rounded-lg border border-villa-smoke/30 bg-villa-ink py-3 pl-12 pr-12 text-sm text-villa-bone placeholder:text-villa-smoke/40 focus:border-villa-fox focus:outline-none focus:ring-1 focus:ring-villa-fox transition-colors"
          aria-label="Buscar productos con lenguaje natural"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-villa-smoke/60 hover:text-villa-bone transition-colors"
            aria-label="Limpiar busqueda"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-villa-smoke/50">
        BUSQUEDA INTELIGENTE
      </p>
    </form>
  );
}
