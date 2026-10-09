import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/auth/',
          '/api/cron/',
          '/api/sync',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
        ],
        allow: '/',
        disallow: [
          '/api/auth/',
          '/api/cron/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
