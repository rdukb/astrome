/**
 * AuspiciousTimesCard Component
 * Displays Abhijit Muhurat and Brahma Muhurat periods
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import type { DailyPanchang, TimePeriod } from '@/types/panchang';
import React from 'react';

interface AuspiciousTimesCardProps {
  panchang: DailyPanchang;
}

export const AuspiciousTimesCard: React.FC<AuspiciousTimesCardProps> = ({ panchang }) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  const TimePeriodRow: React.FC<{
    label: string;
    description: string;
    period: TimePeriod;
    icon: string;
  }> = ({ label, description, period, icon }) => (
    <div className="p-5 rounded-xl bg-gray-100 dark:bg-dark-border/30 border-l-4 border-green-500 hover:shadow-lg hover:border-green-400 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-bold text-green-700 dark:text-green-300 text-lg">{label}</span>
        </div>
        <span className="text-xs px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full font-bold shadow-sm border border-green-500/30">
          {period.duration_minutes} min
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3 leading-relaxed">{description}</p>
      <div className="text-sm text-gray-900 dark:text-dark-text-primary font-semibold flex items-center gap-4">
        <span className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border px-3 py-1.5 rounded shadow-sm">{formatTime(period.start_time)}</span>
        <span className="text-green-400">→</span>
        <span className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border px-3 py-1.5 rounded shadow-sm">{formatTime(period.end_time)}</span>
      </div>
    </div>
  );

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-green-500/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          Auspicious Times
        </h2>
        <span className="text-xs px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full font-bold shadow-sm border border-green-500/30">
          Favorable for Activities
        </span>
      </div>

      <div className="space-y-5">
        {/* Abhijit Muhurat */}
        <TimePeriodRow
          label="Abhijit Muhurat"
          description="The most auspicious period of the day, around noon. Ideal for starting new ventures, signing documents, and performing ceremonies."
          period={panchang.abhijit_muhurat}
          icon="☀️"
        />

        {/* Brahma Muhurat */}
        <TimePeriodRow
          label="Brahma Muhurat"
          description="Sacred pre-dawn period ideal for meditation, study, and spiritual practices. Considered the best time for yoga and prayers."
          period={panchang.brahma_muhurat}
          icon="🌅"
        />
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-400 dark:border-blue-500 rounded-lg shadow-sm">
        <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
          <strong className="text-blue-800 dark:text-blue-300">✨ Sacred Timing:</strong> These muhurat periods are traditionally considered
          highly auspicious for important activities, spiritual practices, and beginning
          new endeavors according to Vedic tradition.
        </p>
      </div>
    </Card>
  );
};
