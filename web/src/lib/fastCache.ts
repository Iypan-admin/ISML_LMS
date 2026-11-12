// ============================================================================
// ISML ENTERPRISE ZERO-LATENCY IN-MEMORY DATA CACHE (0ms SWR ENGINE)
// Instantly serves cached responses (0ms) on page navigation or refresh,
// and background revalidates or updates via SSE Webhook push.
// ============================================================================

type CacheEntry<T = any> = {
  data: T;
  timestamp: number;
};

class ClientFastCache {
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('isml_fast_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.entries(parsed).forEach(([key, val]) => {
            this.cache.set(key, val as CacheEntry);
          });
        }
      } catch {}
    }
  }

  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data as T;
  }

  set<T = any>(key: string, data: T) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);

    if (typeof window !== 'undefined') {
      try {
        const obj: Record<string, any> = {};
        this.cache.forEach((v, k) => {
          obj[k] = v;
        });
        sessionStorage.setItem('isml_fast_cache', JSON.stringify(obj));
      } catch {}
    }
  }

  clear(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      if (typeof window !== 'undefined') sessionStorage.removeItem('isml_fast_cache');
      return;
    }
    const toDelete: string[] = [];
    this.cache.forEach((_, k) => {
      if (k.includes(pattern)) toDelete.push(k);
    });
    toDelete.forEach((k) => this.cache.delete(k));
  }
}

export const fastCache = new ClientFastCache();

// 🚀 Preload all critical portal endpoints in background on first load
export function prefetchAllPortalData() {
  if (typeof window === 'undefined') return;

  const endpoints = [
    'http://localhost:4000/api/portals/student/learning',
    'http://localhost:4000/api/portals/student/profile',
    'http://localhost:4000/api/live-classes',
    'http://localhost:4000/api/portals/batches',
    'http://localhost:4000/api/portals/courses',
    'http://localhost:4000/api/portals/faculty',
    'http://localhost:4000/api/portals/approvals',
    'http://localhost:4000/api/portals/executive-metrics',
    'http://localhost:4000/api/portals/institutions',
    'http://localhost:4000/api/portals/recordings',
    'http://localhost:4000/api/portals/users',
    'http://localhost:4000/api/portals/finance/fee-structures',
    'http://localhost:4000/api/portals/college/bulk-payments',
    'http://localhost:4000/api/portals/curriculum-matrices/schools',
    'http://localhost:4000/api/portals/curriculum-matrices/colleges',
  ];

  endpoints.forEach((url) => {
    if (!fastCache.get(url)) {
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          fastCache.set(url, data);
        })
        .catch(() => {});
    }
  });
}

/**
 * 0ms Instant Fetch Wrapper (Stale-While-Revalidate):
 * 1. Immediately returns cached data in 0ms if present.
 * 2. Background revalidates with backend API.
 * 3. Calls onSuccess callback with fresh data.
 */
export async function fastFetch<T = any>(
  url: string,
  onData: (data: T, fromCache: boolean) => void,
  options?: RequestInit
): Promise<T | null> {
  // 1. Instant 0ms Cache Return
  const cached = fastCache.get<T>(url);
  if (cached) {
    onData(cached, true);
  }

  // 2. Fast background revalidation
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const fresh = await res.json();
      fastCache.set<T>(url, fresh);
      onData(fresh, false);
      return fresh;
    }
  } catch (e) {
    // If backend is slow/offline, cached was already served at 0ms!
  }

  return cached;
}
