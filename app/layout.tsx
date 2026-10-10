import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getBaseUrl } from "@/lib/site";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      "OASE UNUD — Kalender & Sinkronisasi Tugas OASE Moodle Universitas Udayana",
    template: "%s | Kalender OASE UNUD",
  },
  description:
    "Portal sinkronisasi jadwal OASE UNUD ke Google Calendar. Ambil daftar tugas kuliah dari OASE Universitas Udayana secara otomatis.",
  keywords: [
    "OASE",
    "OASE UNUD",
    "OASE Universitas Udayana",
    "Kalender OASE",
    "Portal OASE",
    "Moodle OASE",
    "OASE Moodle UNUD",
    "Google Calendar OASE",
    "Sync OASE ke Google Calendar",
    "Kalender Akademik UNUD",
    "Jadwal Tugas OASE",
    "Deadline OASE",
    "Informatika UNUD",
    "SSO UNUD",
  ],
  authors: [{ name: "Informatika Universitas Udayana" }],
  creator: "Civitas Akademika Universitas Udayana",
  publisher: "Kalender OASE",
  applicationName: "Kalender OASE",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OASE UNUD — Kalender & Sinkronisasi Tugas OASE Moodle",
    description:
      "Hubungkan dan sinkronkan tugas, deadline, dan kuis OASE Moodle UNUD ke Google Calendar Anda secara instan dan otomatis.",
    url: baseUrl,
    siteName: "Kalender OASE UNUD",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 512,
        height: 512,
        alt: "Logo Kalender OASE Universitas Udayana",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "OASE UNUD — Kalender & Sinkronisasi Tugas OASE Moodle",
    description:
      "Sinkronisasi jadwal tugas, kuis, dan ujian dari OASE UNUD ke Google Calendar.",
    images: ["/logo.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "K_u803Dwnf5Z-mC49FhKpp58pmwK9Ofq7pKz3nvpTqw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kalender OASE UNUD",
    alternateName: [
      "OASE",
      "OASE UNUD",
      "Kalender OASE",
      "OASE Moodle",
      "OASE Calendar",
      "OASE Universitas Udayana",
    ],
    url: baseUrl,
    description:
      "Aplikasi akademik untuk menyinkronkan jadwal tugas kuliah dari OASE Universitas Udayana ke Google Calendar.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    provider: {
      "@type": "Organization",
      name: "Universitas Udayana",
      alternateName: "UNUD",
      url: "https://www.unud.ac.id",
    },
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
