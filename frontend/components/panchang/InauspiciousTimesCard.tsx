/**
 * InauspiciousTimesCard Component
 * Displays Rahu Kalam, Gulika Kalam, Yamaganda Kalam, and Durmuhurtam periods
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import type { DailyPanchang, TimePeriod } from '@/types/panchang';
import React from 'react';

interface InauspiciousTimesCardProps {
  panchang: DailyPanchang;
  className?: string;
}

export const InauspiciousTimesCard: React.FC<InauspiciousTimesCardProps> = ({ panchang, className }) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  const TimePeriodRow: React.FC<{
    label: string;
    period: TimePeriod;
    showWarning?: boolean;
  }> = ({ label, period, showWarning = true }) => (
    <div className="p-3 rounded-xl bg-slate-700/30 border-l-4 border-rose-500/60 hover:bg-slate-700/40 hover:border-rose-400 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showWarning && <AlertTriangle className="h-3 w-3 text-rose-400" />}
          <span className="font-bold text-rose-300 text-sm">{label}</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full font-medium border border-rose-500/40">
          {period.duration_minutes} min
        </span>
      </div>
      <div className="mt-3 text-xs text-slate-100 flex items-center gap-3 font-medium">
        <span className="bg-slate-800/60 border border-slate-700/60 px-2 py-1 rounded">{formatTime(period.start_time)}</span>
        <span className="text-rose-400">→</span>
        <span className="bg-slate-800/60 border border-slate-700/60 px-2 py-1 rounded">{formatTime(period.end_time)}</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card
        className={cn(
          'rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 hover:border-slate-600/50',
          className
        )}
      >
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-600/50">
        <h2 className="text-lg font-bold text-rose-400">
          Inauspicious Times
        </h2>
        <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full font-medium border border-rose-500/40">
          Avoid
        </span>
      </div>

      <div className="space-y-2">
        {/* Rahu Kalam */}
        <TimePeriodRow
          label="Rahu Kalam"
          period={panchang.rahu_kalam}
        />

        {/* Gulika Kalam */}
        <TimePeriodRow
          label="Gulika Kalam"
          period={panchang.gulika_kalam}
        />

        {/* Yamaganda Kalam */}
        <TimePeriodRow
          label="Yamaganda Kalam"
          period={panchang.yamaganda_kalam}
        />

        {/* Durmuhurtam */}
        {panchang.durmuhurtam && panchang.durmuhurtam.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rose-500/20">
            <h3 className="font-bold text-slate-200 mb-4 text-sm flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              Durmuhurtam Periods
            </h3>
            <div className="space-y-3">
              {panchang.durmuhurtam.map((period, index) => (
                <TimePeriodRow
                  key={index}
                  label={`Durmuhurtam ${index + 1}`}
                  period={period}
                  showWarning={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Varjyam — backend returns an array (can be multiple periods) */}
        {panchang.varjyam && panchang.varjyam.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rose-500/20">
            <h3 className="font-bold text-slate-200 mb-4 text-sm flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              Varjyam
            </h3>
            <div className="space-y-2">
              {panchang.varjyam.map((period, index) => (
                <TimePeriodRow
                  key={index}
                  label={panchang.varjyam!.length > 1 ? `Varjyam ${index + 1}` : 'Varjyam Period'}
                  period={period}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-3 p-3 bg-amber-500/10 border-l-4 border-amber-400/60 rounded-lg">
        <p className="text-xs text-amber-200 leading-relaxed">
          <strong className="text-amber-300">⚡ Important:</strong> Avoid starting new
          ventures, signing contracts, or important ceremonies during these periods.
        </p>
      </div>
      </Card>
    </motion.div>
  );
};
