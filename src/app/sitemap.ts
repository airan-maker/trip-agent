import type { MetadataRoute } from 'next';
import * as db from '@/lib/db';

const locales = ['ko', 'en', 'ja', 'zh'];
const baseUrl = 'https://www.triptalk.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}`])),
    },
  }));

  let tripRoutes: MetadataRoute.Sitemap = [];
  try {
    const trips = await db.getCompleteTrips();
    tripRoutes = trips.flatMap((trip) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/trip/${trip.id}`,
        lastModified: new Date(trip.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}/trip/${trip.id}`])),
        },
      }))
    );
  } catch {
    // DB unavailable at build time — return static routes only
  }

  return [...staticRoutes, ...tripRoutes];
}
