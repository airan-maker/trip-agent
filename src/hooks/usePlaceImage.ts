import { useState, useEffect } from 'react';

const imageCache = new Map<string, string | null>();

/**
 * Fetches a representative image for a place from Wikipedia.
 * Tries Japanese name first (better hit rate for Japanese locations),
 * then falls back to the Korean/English name.
 */
export function usePlaceImage(name: string, nameLocal?: string | null): {
  imageUrl: string | null;
  loading: boolean;
} {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cacheKey = nameLocal || name;
    if (imageCache.has(cacheKey)) {
      setImageUrl(imageCache.get(cacheKey)!);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchImage() {
      // Try Japanese name first, then Korean name
      const queries = [nameLocal, name].filter(Boolean) as string[];

      for (const query of queries) {
        try {
          const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.thumbnail?.source) {
            // Request a larger image by modifying the thumbnail URL
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
  }, [name, nameLocal]);

  return { imageUrl, loading };
}
