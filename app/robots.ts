import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalender-oase.vercel.app';

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
