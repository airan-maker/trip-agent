import type { MetadataRoute } from 'next';
import * as db from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://www.triptalk.me',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  let tripRoutes: MetadataRoute.Sitemap = [];
  try {
    const trips = await db.getCompleteTrips();
    tripRoutes = trips.map((trip) => ({
      url: `https://www.triptalk.me/trip/${trip.id}`,
      lastModified: new Date(trip.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable at build time — return static routes only
  }

  return [...staticRoutes, ...tripRoutes];
}
