/**
 * InauspiciousTimesCard Component
 * Displays Rahu Kalam, Gulika Kalam, Yamaganda Kalam, and Durmuhurtam periods
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import type { DailyPanchang, TimePeriod } from '@/types/panchang';
import React from 'react';

interface InauspiciousTimesCardProps {
  panchang: DailyPanchang;
}

export const InauspiciousTimesCard: React.FC<InauspiciousTimesCardProps> = ({ panchang }) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  const TimePeriodRow: React.FC<{
    label: string;
    period: TimePeriod;
    showWarning?: boolean;
  }> = ({ label, period, showWarning = true }) => (
    <div className="p-4 rounded-xl bg-gray-100 dark:bg-dark-border/30 border-l-4 border-red-500 hover:shadow-md hover:border-red-400 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showWarning && <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>}
          <span className="font-bold text-red-700 dark:text-red-300">{label}</span>
        </div>
        <span className="text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full font-semibold shadow-sm border border-red-500/30">
          {period.duration_minutes} min
        </span>
      </div>
      <div className="mt-3 text-sm text-gray-900 dark:text-dark-text-primary flex items-center gap-4 font-medium">
        <span className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border px-2 py-1 rounded">{formatTime(period.start_time)}</span>
        <span className="text-red-400">→</span>
        <span className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border px-2 py-1 rounded">{formatTime(period.end_time)}</span>
      </div>
    </div>
  );

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-red-500/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          Inauspicious Times
        </h2>
        <span className="text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full font-bold shadow-sm border border-red-500/30">
          Avoid Important Activities
        </span>
      </div>

      <div className="space-y-3">
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
          <div className="mt-6 pt-6 border-t-2 border-red-300">
            <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 text-lg flex items-center gap-2">
              <span className="text-red-600">📵</span>
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

        {/* Varjyam */}
        {panchang.varjyam && (
          <div className="mt-6 pt-6 border-t-2 border-red-300">
            <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 text-lg flex items-center gap-2">
              <span className="text-red-600">🚫</span>
              Varjyam
            </h3>
            <TimePeriodRow
              label="Varjyam Period"
              period={panchang.varjyam}
            />
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-lg shadow-sm">
        <p className="text-sm text-yellow-900 dark:text-yellow-200 leading-relaxed">
          <strong className="text-yellow-800 dark:text-yellow-300">⚡ Important:</strong> These periods are traditionally considered inauspicious
          for starting new ventures, signing contracts, or performing important ceremonies. Plan accordingly.
        </p>
      </div>
    </Card>
  );
};
