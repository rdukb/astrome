/**
 * PanchangCard Component
 * Displays Tithi, Nakshatra, Yoga, and Karana information
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { DailyPanchang } from '@/types/panchang';
import React from 'react';

interface PanchangCardProps {
  panchang: DailyPanchang;
  showTamil?: boolean;
  className?: string;
}

export const PanchangCard: React.FC<PanchangCardProps> = ({
  panchang,
  showTamil = true,
  className,
}) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={cn(
          'rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 hover:border-slate-600/50',
          className
        )}
      >
      <h2 className="text-lg font-bold mb-3 pb-2 border-b border-slate-600/50 text-amber-400">
        Daily Panchang
      </h2>

      {/* Tithi */}
      <div className="mb-6 pb-6 border-b border-slate-600/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">Tithi</h3>
            {panchang.tithi.at_sunrise && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/40">
                ✓ Prevails at Sunrise
              </span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
            panchang.tithi.paksha === 'Shukla'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-500/20 border-slate-500/40 text-slate-300'
          }`}>
            {panchang.tithi.paksha} Paksha
          </span>
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-bold text-amber-300">
            {panchang.tithi.name}
          </span>
          {showTamil && (
            <span className="text-base text-slate-400 font-medium">
              {panchang.tithi.name_tamil}
            </span>
          )}
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Ends: <span className="font-semibold text-slate-200">{formatTime(panchang.tithi.end_time)}</span>
        </div>
      </div>

      {/* Nakshatra */}
      <div className="mb-6 pb-6 border-b border-slate-600/40">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Nakshatra</h3>
          {panchang.nakshatra.at_sunrise && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/40">
              ✓ Prevails at Sunrise
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-bold text-amber-300">
            {panchang.nakshatra.name}
          </span>
          {showTamil && (
            <span className="text-base text-slate-400 font-medium">
              {panchang.nakshatra.name_tamil}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pada:</span>
            <span className="font-semibold text-slate-200 bg-slate-700/40 px-2 py-0.5 rounded">
              {panchang.nakshatra.pada}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Deity:</span>
            <span className="font-semibold text-slate-200">{panchang.nakshatra.ruling_deity}</span>
          </div>
          <div className="text-slate-400">
            Ends: <span className="font-semibold text-slate-200">{formatTime(panchang.nakshatra.end_time)}</span>
          </div>
        </div>
      </div>

      {/* Yoga */}
      <div className="mb-6 pb-6 border-b border-slate-600/40">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Yoga</h3>
          {panchang.yoga.at_sunrise && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/40">
              ✓ Prevails at Sunrise
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-xl font-bold text-amber-300">
            {panchang.yoga.name}
          </span>
          {showTamil && (
            <span className="text-sm text-slate-400 font-medium">
              {panchang.yoga.name_tamil}
            </span>
          )}
        </div>
        {panchang.yoga.end_time && (
          <div className="mt-2 text-xs text-slate-400">
            Ends: <span className="font-semibold text-slate-200">{formatTime(panchang.yoga.end_time)}</span>
          </div>
        )}
      </div>

      {/* Karana */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Karana</h3>
        <div className="space-y-3">
          {panchang.karana.map((karana, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/40 rounded-lg hover:border-amber-500/40 transition-colors"
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-slate-200 text-sm">
                    {karana.name}
                  </span>
                  {showTamil && (
                    <span className="text-xs text-slate-400">
                      {karana.name_tamil}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  {karana.type} Karana
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-slate-200">{formatTime(karana.start_time)}</div>
                <div className="text-slate-400">{formatTime(karana.end_time)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tamil Calendar Info */}
      <div className="mt-6 pt-6 border-t border-slate-600/40">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-lg">
            <span className="text-slate-400 block mb-1">Tamil Month</span>
            <span className="font-semibold text-amber-300 text-sm">
              {panchang.tamil_month}
            </span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-lg">
            <span className="text-slate-400 block mb-1">Tamil Year</span>
            <span className="font-semibold text-amber-300 text-sm">
              {panchang.tamil_year}
            </span>
          </div>
        </div>
      </div>
      </Card>
    </motion.div>
  );
};
