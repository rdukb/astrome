import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { NavBar } from '@/components/layout/NavBar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://astrome.app'),
  title: {
    default: 'Tamil Panchangam Today | Astrome',
    template: '%s | Astrome',
  },
  description:
    'Daily Tamil Panchangam with accurate local timings for Rahu Kalam, Gulika Kalam, Yamaganda, Abhijit Muhurat, and sunrise-based Vedic calendar elements.',
  keywords: [
    'tamil panchang',
    'tamil panchangam',
    'panchangam today',
    'rahu kalam today',
    'gulika kalam',
    'yamaganda kalam',
    'abhijit muhurat',
    'vedic calendar',
    'hindu calendar',
    'auspicious timing',
    'inauspicious timing',
    'tithi nakshatra yoga karana',
  ],
  authors: [{ name: 'Astrome Development Team' }],
  openGraph: {
    type: 'website',
    url: 'https://astrome.app',
    siteName: 'Astrome',
    title: 'Tamil Panchangam Today | Astrome',
    description:
      'Check Tamil Panchangam timings with location-specific Rahu Kalam, Gulika, Yamaganda, and daily Vedic calendar elements.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tamil Panchangam Today | Astrome',
    description:
      'Location-specific Tamil Panchangam timings for Rahu Kalam, Gulika, Yamaganda, and more.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ef4444',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
