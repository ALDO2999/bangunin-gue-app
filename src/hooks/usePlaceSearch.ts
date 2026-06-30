import { useEffect, useRef, useState } from 'react';
import { secrets } from '../config/secrets';

export type Place = {
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
};

const DEBOUNCE_MS = 600;
const MIN_CHARS = 3;
const RETRY_DELAY_MS = 1100; // wait out the per-second rate limit before retry

/**
 * Builds the search URL. Uses LocationIQ (richer coverage, needs a free key)
 * when a key is configured, otherwise falls back to public OSM Nominatim.
 * Both return the same Nominatim-style JSON shape.
 */
function buildSearchUrl(query: string): string {
  const q = encodeURIComponent(query);
  const key = secrets.locationIqKey;
  if (key) {
    // Bias toward Indonesia for more relevant local results.
    return `https://us1.locationiq.com/v1/search?key=${key}&format=json&limit=6&countrycodes=id&q=${q}`;
  }
  return `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&q=${q}`;
}

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), ms));

/**
 * Fetches search results, retrying once if the API returns 429 (rate limited).
 * Throws an Error tagged with `rateLimited` if it's still limited after retry.
 */
async function fetchPlaces(
  url: string,
  signal: AbortSignal,
): Promise<NominatimResult[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BanguninGue/1.0' },
      signal,
    });
    if (res.status === 429) {
      if (attempt === 0) {
        await sleep(RETRY_DELAY_MS); // give the per-second window time to reset
        continue;
      }
      const err = new Error('rate-limited');
      (err as Error & { rateLimited?: boolean }).rateLimited = true;
      throw err;
    }
    return (await res.json()) as NominatimResult[];
  }
  return [];
}

/**
 * Debounced place search against the public OpenStreetMap Nominatim API.
 *
 * - Waits DEBOUNCE_MS after the user stops typing before firing (≤ 1 req/sec).
 * - Aborts the in-flight request when the query changes, so results never
 *   arrive out of order.
 * - Ignores queries shorter than MIN_CHARS.
 */
export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();

    // Cancel any pending request whenever the query changes.
    abortRef.current?.abort();
    setRateLimited(false);

    if (q.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const data = await fetchPlaces(buildSearchUrl(q), controller.signal);
        setResults(
          data.map(d => ({
            name: d.display_name.split(',')[0],
            fullName: d.display_name,
            latitude: parseFloat(d.lat),
            longitude: parseFloat(d.lon),
          })),
        );
      } catch (e) {
        const err = e as Error & { rateLimited?: boolean };
        // Aborted requests throw — ignore those.
        if (err.name === 'AbortError') {
          return;
        }
        setResults([]);
        if (err.rateLimited) {
          setRateLimited(true);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, loading, rateLimited };
}
