import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* GA4 — loaded only when measurement ID is configured (absent in dev) */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
