import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalender-oase.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'OASE Academic Calendar Sync | Universitas Udayana',
    template: '%s | OASE Academic Calendar Sync',
  },
  description:
    'Sinkronisasi otomatis jadwal perkuliahan, tenggat waktu tugas, kuis, dan ujian dari portal OASE Moodle Universitas Udayana ke Google Calendar dengan sekali klik.',
  keywords: [
    'OASE UNUD',
    'OASE Universitas Udayana',
    'Kalender OASE',
    'Google Calendar OASE',
    'Sync OASE ke Google Calendar',
    'Kalender Akademik UNUD',
    'Moodle iCal Export UNUD',
    'Informatika UNUD',
    'Jadwal Kuliah Udayana',
  ],
  authors: [{ name: 'Informatika Universitas Udayana' }],
  creator: 'Civitas Akademika Universitas Udayana',
  publisher: 'OASE Sync',
  applicationName: 'OASE Calendar Sync',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'OASE Academic Calendar Sync | Universitas Udayana',
    description:
      'Hubungkan dan sinkronkan agenda OASE Moodle UNUD ke Google Calendar Anda secara instan dan otomatis.',
    url: baseUrl,
    siteName: 'OASE Calendar Sync',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/logo.webp',
        width: 512,
        height: 512,
        alt: 'OASE Academic Calendar Sync Logo Universitas Udayana',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'OASE Academic Calendar Sync | Universitas Udayana',
    description:
      'Sinkronisasi jadwal tugas, kuis, dan ujian dari OASE UNUD ke Google Calendar.',
    images: ['/logo.webp'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // WebApplication JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'OASE Academic Calendar Sync',
    url: baseUrl,
    description:
      'Aplikasi utilitas akademik untuk menyinkronkan jadwal perkuliahan dari OASE Moodle Universitas Udayana ke Google Calendar.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
  };

  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
