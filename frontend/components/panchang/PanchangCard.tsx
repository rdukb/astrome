/**
 * PanchangCard Component
 * Displays Tithi, Nakshatra, Yoga, and Karana information
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import type { DailyPanchang } from '@/types/panchang';
import React from 'react';

interface PanchangCardProps {
  panchang: DailyPanchang;
  showTamil?: boolean;
}

export const PanchangCard: React.FC<PanchangCardProps> = ({
  panchang,
  showTamil = true
}) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b-2 border-purple-500/50 pb-2">
        Daily Panchang
      </h2>

      {/* Tithi */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-200 dark:border-dark-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tithi</h3>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border ${
            panchang.tithi.paksha === 'Shukla'
              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
              : 'bg-slate-500/20 border-slate-500/30 text-slate-300'
          }`}>
            {panchang.tithi.paksha} Paksha
          </span>
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-purple-400">
            {panchang.tithi.name}
          </span>
          {showTamil && (
            <span className="text-xl text-gray-600 dark:text-dark-text-secondary font-medium">
              {panchang.tithi.name_tamil}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Ends: <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{formatTime(panchang.tithi.end_time)}</span>
          </span>
          {panchang.tithi.at_sunrise && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium shadow-sm border border-green-500/30">
              ✓ At Sunrise
            </span>
          )}
        </div>
      </div>

      {/* Nakshatra */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-dark-border/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Nakshatra</h3>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-purple-400">
            {panchang.nakshatra.name}
          </span>
          {showTamil && (
            <span className="text-xl text-gray-600 dark:text-dark-text-secondary font-medium">
              {panchang.nakshatra.name_tamil}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-dark-text-secondary">Pada:</span>
            <span className="font-semibold text-gray-900 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-border/30 px-2 py-0.5 rounded">
              {panchang.nakshatra.pada}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-dark-text-secondary">Deity:</span>
            <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{panchang.nakshatra.ruling_deity}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-dark-text-secondary">
              Ends: <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{formatTime(panchang.nakshatra.end_time)}</span>
            </span>
            {panchang.nakshatra.at_sunrise && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium shadow-sm border border-green-500/30">
                ✓ At Sunrise
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Yoga */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-dark-border/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Yoga</h3>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-bold text-purple-400">
            {panchang.yoga.name}
          </span>
          {showTamil && (
            <span className="text-lg text-gray-600 dark:text-dark-text-secondary font-medium">
              {panchang.yoga.name_tamil}
            </span>
          )}
        </div>
        {panchang.yoga.end_time && (
          <div className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Ends: <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{formatTime(panchang.yoga.end_time)}</span>
          </div>
        )}
      </div>

      {/* Karana */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Karana</h3>
        <div className="space-y-3">
          {panchang.karana.map((karana, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-dark-border/30 border border-dark-border rounded-lg hover:shadow-md hover:border-purple-400/50 transition-all">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-gray-900 dark:text-dark-text-primary text-base">
                    {karana.name}
                  </span>
                  {showTamil && (
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      {karana.name_tamil}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1 font-medium">
                  {karana.type} Karana
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold text-gray-900 dark:text-dark-text-primary">{formatTime(karana.start_time)}</div>
                <div className="text-gray-600 dark:text-dark-text-secondary">{formatTime(karana.end_time)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tamil Calendar Info */}
      <div className="mt-6 pt-6 border-t-2 border-dark-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-orange-500/20 border border-orange-500/30 p-3 rounded-lg">
            <span className="text-gray-600 dark:text-dark-text-secondary text-xs block mb-1">Tamil Month</span>
            <span className="font-semibold text-orange-300 text-base">
              {panchang.tamil_month}
            </span>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 p-3 rounded-lg">
            <span className="text-gray-600 dark:text-dark-text-secondary text-xs block mb-1">Tamil Year</span>
            <span className="font-semibold text-orange-300 text-base">
              {panchang.tamil_year}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
