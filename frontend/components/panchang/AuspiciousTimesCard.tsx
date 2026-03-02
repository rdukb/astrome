/**
 * AuspiciousTimesCard Component
 * Displays Abhijit Muhurat and Brahma Muhurat periods
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import { cn } from '@/lib/utils';
import { Sparkles, Sunrise } from 'lucide-react';
import { motion } from 'motion/react';
import type { DailyPanchang, TimePeriod } from '@/types/panchang';
import React from 'react';

interface AuspiciousTimesCardProps {
  panchang: DailyPanchang;
  className?: string;
}

export const AuspiciousTimesCard: React.FC<AuspiciousTimesCardProps> = ({ panchang, className }) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  const TimePeriodRow: React.FC<{
    label: string;
    description: string;
    period: TimePeriod;
    icon: React.ReactNode;
  }> = ({ label, description, period, icon }) => (
    <div className="p-3 rounded-xl bg-slate-700/30 border-l-4 border-emerald-500/60 hover:bg-slate-700/40 hover:border-emerald-400 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">{icon}</span>
          <span className="font-bold text-emerald-300 text-sm">{label}</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/40">
          {period.duration_minutes} min
        </span>
      </div>
      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{description}</p>
      <div className="text-xs text-slate-100 font-semibold flex items-center gap-3">
        <span className="bg-slate-800/60 border border-slate-700/60 px-2 py-1 rounded">{formatTime(period.start_time)}</span>
        <span className="text-emerald-400">→</span>
        <span className="bg-slate-800/60 border border-slate-700/60 px-2 py-1 rounded">{formatTime(period.end_time)}</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card
        className={cn(
          'rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 hover:border-slate-600/50',
          className
        )}
      >
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-600/50">
        <h2 className="text-lg font-bold text-emerald-400">
          Auspicious Times
        </h2>
        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/40">
          Favorable
        </span>
      </div>

      <div className="space-y-3">
        {/* Abhijit Muhurat */}
        <TimePeriodRow
          label="Abhijit Muhurat"
          description="The most auspicious period of the day, around noon. Ideal for starting new ventures, signing documents, and performing ceremonies."
          period={panchang.abhijit_muhurat}
          icon={<Sparkles className="h-4 w-4" />}
        />

        {/* Brahma Muhurat */}
        <TimePeriodRow
          label="Brahma Muhurat"
          description="Sacred pre-dawn period ideal for meditation, study, and spiritual practices. Considered the best time for yoga and prayers."
          period={panchang.brahma_muhurat}
          icon={<Sunrise className="h-4 w-4" />}
        />
      </div>

      {/* Info Note */}
      <div className="mt-3 p-3 bg-blue-500/10 border-l-4 border-blue-400/60 rounded-lg">
        <p className="text-xs text-blue-200 leading-relaxed">
          <strong className="text-blue-300">✨ Sacred Timing:</strong> These periods are
          highly auspicious for important activities according to Vedic tradition.
        </p>
      </div>
      </Card>
    </motion.div>
  );
};
