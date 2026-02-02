import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/trip/*'],
        disallow: ['/chat/*', '/api/*'],
      },
    ],
    sitemap: 'https://www.triptalk.me/sitemap.xml',
  };
}
