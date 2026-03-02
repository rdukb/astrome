/**
 * NavBar — top navigation bar shared across all pages.
 * Keeps the design language of the main page (dark slate/indigo/amber).
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/',       label: 'Panchangam' },
  { href: '/help',   label: 'Help' },
  { href: '/about',  label: 'About' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
        >
          {/* Simple sun glyph — no external icon dep needed */}
          <span className="text-xl" aria-hidden="true">☀</span>
          <span className="text-base font-bold tracking-wide">Astrome</span>
        </Link>

        {/* Nav links */}
        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
