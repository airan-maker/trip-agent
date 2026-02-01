import { useState, useEffect } from 'react';

const imageCache = new Map<string, string | null>();

/**
 * Fetches a representative image for a place.
 * Priority: DB cache → memory cache → Google Places API → Wikipedia fallback.
 */
export function usePlaceImage(
  name: string,
  nameLocal?: string | null,
  placeId?: string,
  dbImageUrl?: string | null,
): {
  imageUrl: string | null;
  loading: boolean;
} {
  const [imageUrl, setImageUrl] = useState<string | null>(dbImageUrl ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. DB-cached image available — use immediately
    if (dbImageUrl) {
      const cacheKey = nameLocal || name;
      imageCache.set(cacheKey, dbImageUrl);
      setImageUrl(dbImageUrl);
      return;
    }

    const cacheKey = nameLocal || name;

    // 2. Memory cache hit
    if (imageCache.has(cacheKey)) {
      setImageUrl(imageCache.get(cacheKey)!);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchImage() {
      // 3. Try Google Places API (server-side proxy)
      if (placeId) {
        try {
          const params = new URLSearchParams({ placeId, name });
          if (nameLocal) params.set('nameLocal', nameLocal);
          const res = await fetch(`/api/places/image?${params}`);
          if (res.ok) {
            const data = await res.json();
            if (data.imageUrl) {
              if (!cancelled) {
                imageCache.set(cacheKey, data.imageUrl);
                setImageUrl(data.imageUrl);
                setLoading(false);
              }
              return;
            }
          }
        } catch {
          // Fall through to Wikipedia
        }
      }

      // 4. Wikipedia fallback (existing logic)
      const queries = [nameLocal, name].filter(Boolean) as string[];

      for (const query of queries) {
        try {
          const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.thumbnail?.source) {
            const largeUrl = data.thumbnail.source.replace(/\/\d+px-/, '/400px-');
            if (!cancelled) {
              imageCache.set(cacheKey, largeUrl);
              setImageUrl(largeUrl);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Continue to next query
        }
      }

      // Try English Wikipedia as fallback
      for (const query of queries) {
        try {
          const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.thumbnail?.source) {
            const largeUrl = data.thumbnail.source.replace(/\/\d+px-/, '/400px-');
            if (!cancelled) {
              imageCache.set(cacheKey, largeUrl);
              setImageUrl(largeUrl);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Continue
        }
      }

      if (!cancelled) {
        imageCache.set(cacheKey, null);
        setImageUrl(null);
        setLoading(false);
      }
    }

    fetchImage();
    return () => { cancelled = true; };
  }, [name, nameLocal, placeId, dbImageUrl]);

  return { imageUrl, loading };
}
