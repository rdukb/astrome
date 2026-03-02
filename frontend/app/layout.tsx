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
  title: 'Tamil Panchangam',
  description: 'Daily Vedic Almanac for Auspicious Timing - Tamil Tradition',
  keywords: ['panchang', 'panchangam', 'tamil', 'vedic', 'almanac', 'astrology', 'hindu', 'calendar'],
  authors: [{ name: 'Astrome Development Team' }],
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
