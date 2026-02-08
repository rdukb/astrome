/**
 * SunTimesCard Component
 * Displays sunrise, sunset, moonrise, and moonset times
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import type { DailyPanchang } from '@/types/panchang';
import React from 'react';

interface SunTimesCardProps {
  panchang: DailyPanchang;
}

export const SunTimesCard: React.FC<SunTimesCardProps> = ({ panchang }) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  const timeItems = [
    {
      icon: '🌅',
      label: 'Sunrise',
      time: panchang.sunrise,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: '🌇',
      label: 'Sunset',
      time: panchang.sunset,
      color: 'text-orange-800',
      bgColor: 'bg-orange-100'
    },
    {
      icon: '🌙',
      label: 'Moonrise',
      time: panchang.moonrise,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '🌘',
      label: 'Moonset',
      time: panchang.moonset,
      color: 'text-blue-800',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-text-primary border-b-2 border-purple-500/50 pb-2">
        Sun & Moon Times
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {timeItems.map((item, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-gray-100 dark:bg-dark-border/30 border border-gray-200 dark:border-dark-border transition-all hover:scale-105 hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-400/50 duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-gray-600 dark:text-dark-text-secondary mb-1">
                  {item.label}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {formatTime(item.time)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Day Length */}
      <div className="mt-6 p-5 bg-gray-100 dark:bg-dark-border/30 rounded-xl border border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">Day Length</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
            {(() => {
              const sunrise = new Date(panchang.sunrise);
              const sunset = new Date(panchang.sunset);
              const diff = sunset.getTime() - sunrise.getTime();
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              return `${hours}h ${minutes}m`;
            })()}
          </span>
        </div>
      </div>
    </Card>
  );
};
