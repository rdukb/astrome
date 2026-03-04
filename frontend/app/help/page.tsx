/**
 * Help Page — explains Panchang concepts to first-time users
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help — Tamil Panchangam',
  description: 'Guide to reading and understanding the Tamil Panchangam',
  alternates: {
    canonical: '/help',
  },
};

/* ── Section data ────────────────────────────────────────────────────────── */

const PANCHANG_ELEMENTS = [
  {
    id: 'tithi',
    term: 'Tithi',
    tamil: 'திதி',
    glyph: '🌙',
    summary: 'Lunar day — the most fundamental unit of the Panchang.',
    details: [
      'A Tithi is defined by the Moon moving 12° ahead of the Sun in longitude.',
      'There are 30 Tithis in a lunar month — 15 in the waxing phase (Shukla Paksha) and 15 in the waning phase (Krishna Paksha).',
      'The Tithi prevailing at local sunrise governs the entire calendar day in the Vedic tradition.',
      'Duration varies from about 19 to 27 hours depending on the Moon\'s speed, so a Tithi can occasionally skip a sunrise entirely.',
    ],
    examples: ['Pratipada (1st)', 'Ashtami (8th)', 'Ekadashi (11th)', 'Purnima (Full Moon)', 'Amavasya (New Moon)'],
  },
  {
    id: 'nakshatra',
    term: 'Nakshatra',
    tamil: 'நட்சத்திரம்',
    glyph: '⭐',
    summary: 'Lunar mansion — the zodiacal segment the Moon occupies.',
    details: [
      'The sky is divided into 27 equal segments of 13°20\' each, called Nakshatras.',
      'Each Nakshatra has 4 subdivisions called Padas (quarters), making 108 Padas in total.',
      'The Moon takes approximately 27.3 days to complete one orbit, spending roughly a day in each Nakshatra.',
      'Each Nakshatra is associated with a ruling deity and has specific qualities used in Muhurta selection.',
    ],
    examples: ['Ashwini (1)', 'Rohini (4)', 'Pushya (8)', 'Chitra (14)', 'Revati (27)'],
  },
  {
    id: 'yoga',
    term: 'Yoga',
    tamil: 'யோகம்',
    glyph: '🔆',
    summary: 'Astrological combination formed by adding Sun and Moon longitudes.',
    details: [
      'Yoga = (Sun longitude + Moon longitude) ÷ 13°20\'',
      'There are 27 Yogas, each spanning 13°20\' of the combined Sun–Moon arc.',
      'Some Yogas (like Vishkambha, Atiganda, Vyatipata, Vaidhriti) are considered inauspicious for starting new ventures.',
      'Auspicious Yogas (like Siddhi, Shubha, Brahma) are preferred for important ceremonies.',
    ],
    examples: ['Vishkambha (inauspicious)', 'Priti (auspicious)', 'Siddhi (very auspicious)', 'Vaidhriti (inauspicious)'],
  },
  {
    id: 'karana',
    term: 'Karana',
    tamil: 'கரணம்',
    glyph: '⚖️',
    summary: 'Half of a Tithi — approximately 6 hours long.',
    details: [
      'Each Tithi is divided into two Karanas, so there are 2 Karanas per day.',
      'There are 11 types of Karanas: 7 movable (Bava, Balava, Kaulava, Taitila, Garija, Vanija, Vishti) and 4 fixed (Shakuni, Chatushpada, Naga, Kimstughna).',
      'Vishti Karana (also called Bhadra) is considered inauspicious for auspicious activities.',
      'The start and end times shown are when each Karana becomes active at your location.',
    ],
    examples: ['Bava (auspicious)', 'Vishti/Bhadra (inauspicious)', 'Vanija (good for trade)'],
  },
];

const TIME_PERIODS = [
  {
    id: 'rahu',
    term: 'Rahu Kalam',
    tamil: 'ராகு காலம்',
    glyph: '🚫',
    type: 'inauspicious' as const,
    summary: '90-minute inauspicious period governed by the shadow planet Rahu.',
    details: [
      'Rahu Kalam occurs once every day and its position in the day depends on the weekday.',
      'It is 1/8th of the daylight duration, calculated from sunrise to sunset.',
      'Starting new ventures, travel, or auspicious activities during Rahu Kalam is traditionally avoided.',
      'The period shifts daily: Mon (7:30–9:00), Tue (15:00–16:30), Wed (12:00–13:30), Thu (13:30–15:00), Fri (10:30–12:00), Sat (9:00–10:30), Sun (16:30–18:00) — these are approximate; your app shows the exact times for your location.',
    ],
  },
  {
    id: 'gulika',
    term: 'Gulika Kalam',
    tamil: 'குளிகை காலம்',
    glyph: '🚫',
    type: 'inauspicious' as const,
    summary: '90-minute inauspicious period associated with Saturn\'s son Gulika.',
    details: [
      'Similar to Rahu Kalam in duration (1/8th of daylight), Gulika Kalam is governed by Mandi (Gulika), a sub-planet of Saturn.',
      'Activities started during Gulika Kalam are believed to face obstacles and delays.',
      'It is especially inauspicious for financial transactions, signing agreements, and weddings.',
    ],
  },
  {
    id: 'yamaganda',
    term: 'Yamaganda',
    tamil: 'யமகண்டம்',
    glyph: '🚫',
    type: 'inauspicious' as const,
    summary: '90-minute inauspicious period associated with Yama, the lord of death.',
    details: [
      'Also 1/8th of the daylight period, governed by Yama.',
      'Traditionally avoided for travel, especially journeys to the south.',
      'Not as universally observed as Rahu Kalam but still considered inauspicious in Tamil tradition.',
    ],
  },
  {
    id: 'durmuhurtam',
    term: 'Durmuhurtam',
    tamil: 'துர்முஹூர்த்தம்',
    glyph: '⚠️',
    type: 'inauspicious' as const,
    summary: 'Two daily inauspicious windows, each about 48 minutes long.',
    details: [
      'Durmuhurtam literally means "bad time" — there are 2 per day, derived from the Muhurta system that divides daylight into 15 equal parts.',
      'The specific Durmuhurtam windows depend on the weekday.',
      'Shorter than the Kalam periods but equally avoided for auspicious starts.',
    ],
  },
  {
    id: 'abhijit',
    term: 'Abhijit Muhurta',
    tamil: 'அபிஜித் முஹூர்த்தம்',
    glyph: '✨',
    type: 'auspicious' as const,
    summary: 'The most auspicious 48-minute window of the day, centred on solar noon.',
    details: [
      'Abhijit Muhurta spans the 8th Muhurta of the day — the period closest to local solar noon.',
      'It is ruled by the Sun and considered universally auspicious regardless of other planetary positions.',
      'Ideal for starting important work, signing agreements, travel, or any activity where a good Muhurta is needed but no astrologer is available.',
      'Not available on Wednesdays in traditional Muhurta calculation.',
    ],
  },
  {
    id: 'brahma',
    term: 'Brahma Muhurta',
    tamil: 'பிரம்ம முஹூர்த்தம்',
    glyph: '🌅',
    type: 'auspicious' as const,
    summary: 'Pre-dawn 48-minute window, 1.5 hours before sunrise — ideal for meditation.',
    details: [
      'Brahma Muhurta begins 1 hour 36 minutes before sunrise (two Muhurtas before sunrise).',
      'Considered the most spiritually potent time of the day for meditation, yoga, prayer, and study.',
      'The Vata (air) element dominates this time, enhancing clarity of mind and creativity.',
      'Waking during Brahma Muhurta is a core recommendation in Ayurvedic daily routine (Dinacharya).',
    ],
  },
];

const HOW_TO_USE = [
  {
    step: 1,
    title: 'Allow location access',
    body: 'The app requests your browser location to calculate precise sunrise/sunset times for your area. All calculations happen on our server — your coordinates are never stored.',
  },
  {
    step: 2,
    title: 'Or pick a city',
    body: 'Use the location picker to choose from 100+ Indian cities. The timezone is automatically set based on the selected city.',
  },
  {
    step: 3,
    title: 'Navigate dates',
    body: 'Use the date selector to browse any date within ±100 years. The Panchang is recalculated instantly for each date and location.',
  },
  {
    step: 4,
    title: 'Read the "Prevails at Sunrise" badge',
    body: 'The green badge means this Tithi, Nakshatra, or Yoga was active when the sun rose — making it the governing element for the calendar day.',
  },
  {
    step: 5,
    title: 'Plan around the time windows',
    body: 'Check the inauspicious periods (Rahu Kalam, Gulika, Yamaganda) to avoid them and use Abhijit Muhurta or Brahma Muhurta for important activities.',
  },
];

/* ── Page component ──────────────────────────────────────────────────────── */

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* ── Page header ── */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Understanding the Panchangam
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            A practical guide to reading the five limbs of the Vedic almanac
            and using daily time windows for auspicious planning.
          </p>
        </div>

        {/* ── How to use ── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-amber-400 mb-5">How to use this app</h2>
          <div className="space-y-3">
            {HOW_TO_USE.map(({ step, title, body }) => (
              <div
                key={step}
                className="flex gap-4 rounded-xl bg-slate-800/50 border border-slate-700/50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold">
                  {step}
                </span>
                <div>
                  <p className="font-semibold text-slate-100 text-sm mb-1">{title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Panchang five limbs ── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-amber-400 mb-2">
            The five limbs of the Panchangam
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            <em>Pancha</em> = five, <em>anga</em> = limb. The five elements below
            are consulted together when selecting auspicious timings.
          </p>
          <div className="space-y-5">
            {PANCHANG_ELEMENTS.map(({ id, term, tamil, glyph, summary, details, examples }) => (
              <div
                key={id}
                className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl" aria-hidden="true">{glyph}</span>
                  <div>
                    <h3 className="text-lg font-bold text-amber-300">
                      {term}
                      <span className="ml-2 text-sm font-normal text-slate-400">{tamil}</span>
                    </h3>
                    <p className="text-slate-300 text-sm mt-0.5">{summary}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-3 pl-1">
                  {details.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-slate-600 shrink-0">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                {examples && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {examples.map((ex) => (
                      <span
                        key={ex}
                        className="rounded-full bg-slate-700/60 border border-slate-600/40 px-2.5 py-0.5 text-[11px] text-slate-300"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Time periods ── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-amber-400 mb-2">
            Daily time windows
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            All times are calculated from the precise local sunrise and sunset for your selected location and date.
          </p>

          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
            Inauspicious periods — avoid for important starts
          </h3>
          <div className="space-y-4 mb-8">
            {TIME_PERIODS.filter(p => p.type === 'inauspicious').map(({ id, term, tamil, glyph, summary, details }) => (
              <div
                key={id}
                className="rounded-2xl bg-slate-800/60 border border-red-900/30 p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xl" aria-hidden="true">{glyph}</span>
                  <div>
                    <h4 className="text-base font-bold text-red-300">
                      {term}
                      <span className="ml-2 text-sm font-normal text-slate-400">{tamil}</span>
                    </h4>
                    <p className="text-slate-300 text-sm mt-0.5">{summary}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {details.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-slate-600 shrink-0">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Auspicious periods — preferred for important activities
          </h3>
          <div className="space-y-4">
            {TIME_PERIODS.filter(p => p.type === 'auspicious').map(({ id, term, tamil, glyph, summary, details }) => (
              <div
                key={id}
                className="rounded-2xl bg-slate-800/60 border border-emerald-900/30 p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xl" aria-hidden="true">{glyph}</span>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">
                      {term}
                      <span className="ml-2 text-sm font-normal text-slate-400">{tamil}</span>
                    </h4>
                    <p className="text-slate-300 text-sm mt-0.5">{summary}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {details.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-slate-600 shrink-0">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Accuracy note ── */}
        <section className="mb-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5">
          <h2 className="text-base font-bold text-amber-300 mb-2">📐 About accuracy</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>
              Calculations use the <strong className="text-slate-100">Swiss Ephemeris</strong> (Moshier method)
              with the <strong className="text-slate-100">Lahiri ayanamsa</strong>, which is the standard for
              Tamil and most South Indian Panchangams.
            </p>
            <p>
              Tithi, Nakshatra, and Yoga boundaries are computed to{' '}
              <strong className="text-slate-100">±1 minute</strong> precision using a bisection algorithm.
              Sunrise and sunset times include atmospheric refraction corrections.
            </p>
            <p>
              Results are consistent with published Panchangams from Ahobila Mutt and Drikpanchang.com
              to within the ±2-minute tolerance typical of published almanacs.
            </p>
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-center">
          <Link
            href="/"
            className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-5 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            ← Back to Panchangam
          </Link>
          <Link
            href="/about"
            className="rounded-lg bg-slate-700/50 border border-slate-600/50 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700/80 transition-colors"
          >
            About & Feedback →
          </Link>
        </div>

      </div>
    </div>
  );
}
