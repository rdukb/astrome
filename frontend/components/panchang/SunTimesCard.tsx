/**
 * SunTimesCard Component
 * Displays compact sunrise/sunset/moonrise/moonset stats
 */

import { Card } from '@/components/ui/Card';
import { formatTime as formatPanchangTime } from '@/lib/format-time';
import { cn } from '@/lib/utils';
import { Clock, Moon, MoonStar, Sunrise, Sunset } from 'lucide-react';
import { motion } from 'motion/react';
import type { DailyPanchang } from '@/types/panchang';
import React from 'react';

interface SunTimesCardProps {
  panchang: DailyPanchang;
  className?: string;
}

export const SunTimesCard: React.FC<SunTimesCardProps> = ({ panchang, className }) => {
  const formatTime = (isoString: string) =>
    formatPanchangTime(isoString, { timezone: panchang.timezone });

  const dayLength = (() => {
    const sunrise = new Date(panchang.sunrise);
    const sunset = new Date(panchang.sunset);
    const diff = Math.max(0, sunset.getTime() - sunrise.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  })();

  const timeItems = [
    {
      icon: Sunrise,
      label: 'Sunrise',
      time: panchang.sunrise,
      color: 'text-orange-400',
    },
    {
      icon: Sunset,
      label: 'Sunset',
      time: panchang.sunset,
      color: 'text-orange-500',
    },
    {
      icon: Moon,
      label: 'Moonrise',
      time: panchang.moonrise,
      color: 'text-cyan-400',
    },
    {
      icon: MoonStar,
      label: 'Moonset',
      time: panchang.moonset,
      color: 'text-cyan-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card
        className={cn(
          'rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 hover:border-slate-600/50',
          className
        )}
      >
      <h2 className="text-lg font-bold mb-3 pb-2 border-b border-slate-600/50 text-cyan-400">
        Sun & Moon Times
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {timeItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className="rounded-xl border border-slate-700/60 bg-slate-700/30 p-3 transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-700/40"
          >
            <div className="flex items-center gap-2">
              <item.icon className={cn('h-5 w-5', item.color)} />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-white whitespace-nowrap">
                  {formatTime(item.time)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        <div className="rounded-xl border border-slate-700/60 bg-slate-700/30 p-3 col-span-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                Day Length
              </p>
              <p className="text-lg font-bold text-white">{dayLength}</p>
            </div>
          </div>
        </div>
      </div>
      </Card>
    </motion.div>
  );
};
