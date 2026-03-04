/**
 * About page — project info, tech credits, and feedback link.
 * Server component; no interactivity needed beyond external links.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Astrome Tamil Panchangam',
  description:
    'About Astrome, the open-source Tamil Panchangam app powered by Swiss Ephemeris and Vedic astronomy.',
  alternates: {
    canonical: '/about',
  },
};

/* ── small presentational helpers ────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-amber-400 mb-4 pb-2 border-b border-slate-700/60">
      {children}
    </h2>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-lg p-5 sm:p-6 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ── data ─────────────────────────────────────────────────────────────────── */

const TECH_STACK = [
  {
    label: 'Ephemeris',
    value: 'Swiss Ephemeris (pyswisseph)',
    note: 'Moshier built-in — no external data files required',
  },
  {
    label: 'Ayanamsa',
    value: 'Lahiri (Chitrapaksha)',
    note: 'Standard for Indian government almanacs',
  },
  {
    label: 'Backend',
    value: 'FastAPI + Pydantic v2',
    note: 'Python 3.12, stateless REST API',
  },
  {
    label: 'Frontend',
    value: 'Next.js 15 + Tailwind CSS v4',
    note: 'App Router, static-export capable',
  },
  {
    label: 'Precision',
    value: '~1 arc-minute (~1 min of time)',
    note: 'Bisection search on planetary longitudes',
  },
  {
    label: 'Hosting',
    value: 'Firebase Hosting + GCP Cloud Run',
    note: 'CDN-served frontend, containerised backend',
  },
];

const WHAT_WE_COMPUTE = [
  { glyph: '🌒', name: 'Tithi', desc: 'Lunar day — each 12° of Moon–Sun elongation' },
  { glyph: '⭐', name: 'Nakshatra', desc: "Moon's sidereal mansion (27 divisions of the ecliptic)" },
  { glyph: '☯', name: 'Yoga', desc: 'Sun + Moon longitude sum — 27 auspicious/inauspicious qualities' },
  { glyph: '◑', name: 'Karana', desc: 'Half-Tithi periods — fixed and movable types' },
  { glyph: '🌅', name: 'Sunrise / Sunset', desc: 'Topocentric, with atmospheric refraction' },
  { glyph: '🌙', name: 'Moonrise / Moonset', desc: 'Observer-specific lunar rise and set times' },
  { glyph: '⏱', name: 'Muhurta windows', desc: 'Rahu Kalam, Gulika, Yamaganda, Abhijit, and more' },
  { glyph: '📅', name: 'Tamil calendar', desc: 'Tamil month and 60-year Samvatsara cycle year name' },
];

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 pb-16">
      {/* ── Hero ── */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 py-10 px-4 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">☀</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-400 mb-2">
          Astrome
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          An open-source Tamil Panchangam — daily Vedic almanac data powered by Swiss Ephemeris
          and delivered with sub-arc-minute precision.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10 space-y-10">

        {/* ── What we compute ── */}
        <section aria-labelledby="what-we-compute">
          <SectionHeading>What we compute</SectionHeading>
          <Card>
            <ul className="divide-y divide-slate-700/40">
              {WHAT_WE_COMPUTE.map(({ glyph, name, desc }) => (
                <li key={name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-xl mt-0.5 shrink-0" aria-hidden="true">{glyph}</span>
                  <div>
                    <span className="font-semibold text-slate-100">{name}</span>
                    <span className="text-slate-400 text-sm"> — {desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ── How it works ── */}
        <section aria-labelledby="how-it-works">
          <SectionHeading>How it works</SectionHeading>
          <Card className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              All planetary positions are computed in real-time from the{' '}
              <span className="text-amber-300 font-medium">Swiss Ephemeris</span> (Moshier
              built-in), so no external data files are shipped or downloaded. The{' '}
              <span className="text-amber-300 font-medium">Lahiri ayanamsa</span> is applied for
              sidereal calculations, matching the system used by the Government of India&apos;s
              National Panchang.
            </p>
            <p>
              Boundary detection (when a Tithi, Nakshatra, or Yoga ends) uses a{' '}
              <span className="text-amber-300 font-medium">two-phase bisection algorithm</span>:
              a coarse 30-minute bracket scan finds the rough crossing, then binary search
              narrows it to ±0.0042° — roughly one arc-minute, or about one minute of clock
              time.
            </p>
            <p>
              The{' '}
              <span className="text-amber-300 font-medium">&ldquo;Prevails at Sunrise&rdquo;</span>{' '}
              flag is computed using the actual topocentric sunrise Julian Day from{' '}
              <code className="text-xs bg-slate-700/60 px-1.5 py-0.5 rounded font-mono text-emerald-300">
                swe.rise_trans()
              </code>
              , not a crude 6 AM estimate. This correctly identifies which element governs the
              calendar day in the Vedic tradition.
            </p>
          </Card>
        </section>

        {/* ── Tech stack ── */}
        <section aria-labelledby="tech-stack">
          <SectionHeading>Tech stack</SectionHeading>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-700/40">
                {TECH_STACK.map(({ label, value, note }) => (
                  <tr key={label} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 pl-5 pr-3 font-medium text-slate-400 whitespace-nowrap w-32 align-top">
                      {label}
                    </td>
                    <td className="py-3 pr-5">
                      <span className="font-semibold text-amber-300">{value}</span>
                      {note && (
                        <span className="block text-xs text-slate-500 mt-0.5">{note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* ── Accuracy & caveats ── */}
        <section aria-labelledby="accuracy">
          <SectionHeading>Accuracy &amp; caveats</SectionHeading>
          <Card className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <ul className="space-y-2">
              {[
                'Results are accurate for dates between 1800 CE and 2400 CE (Moshier ephemeris range).',
                'Location matters — sunrise, Rahu Kalam, and muhurta windows shift with latitude/longitude. Always provide your correct city.',
                'Traditional printed almanacs may differ slightly due to rounding conventions or regional ayanamsa variants.',
                'Daylight Saving Time is handled automatically via the IANA timezone database.',
                'This app is for informational purposes. Consult a qualified Jyotishi for ceremonial muhurta selection.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ── Feedback ── */}
        <section aria-labelledby="feedback">
          <SectionHeading>Feedback &amp; contributions</SectionHeading>
          <Card className="space-y-5">
            <p className="text-sm text-slate-300 leading-relaxed">
              Found a bug? Have a suggestion? The source code is on GitHub. Pull requests,
              issues, and stars are all very welcome.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* GitHub */}
              <a
                href="https://github.com/rdukb/astrome"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-600/60 bg-slate-700/40 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/60 transition-colors"
              >
                {/* GitHub mark (SVG inline, no icon dep) */}
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                </svg>
                View source on GitHub
              </a>

              {/* Issues */}
              <a
                href="https://github.com/rdukb/astrome/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-medium text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/60 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Report a bug / suggest a feature
              </a>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700/50 pt-4">
              <p className="text-xs text-slate-500">
                Not on GitHub? You can also reach the maintainer at{' '}
                <a
                  href="mailto:feedback@astrome.app"
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                >
                  feedback@astrome.app
                </a>
              </p>
            </div>
          </Card>
        </section>

        {/* ── Footer nav ── */}
        <div className="flex items-center justify-center gap-6 pt-4 text-sm">
          <Link
            href="/"
            className="text-slate-400 hover:text-amber-300 transition-colors"
          >
            ← Today&apos;s Panchangam
          </Link>
          <span className="text-slate-700" aria-hidden="true">|</span>
          <Link
            href="/help"
            className="text-slate-400 hover:text-amber-300 transition-colors"
          >
            Help guide →
          </Link>
        </div>

      </div>
    </main>
  );
}
