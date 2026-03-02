/**
 * DateSelector Component
 * Date picker with today button and navigation
 */

import dayjs from 'dayjs';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handlePrevDay = () => {
    const newDate = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(dayjs().format('YYYY-MM-DD'));
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const displayDate = dayjs(selectedDate).format('dddd, MMMM D, YYYY');

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/60 px-3 py-2 backdrop-blur-md">
      <button
        onClick={handlePrevDay}
        className="rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-slate-100"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 items-center gap-2">
        <Calendar className="h-4 w-4 shrink-0 text-amber-400" />
        <span className="max-w-[18rem] truncate text-sm font-medium text-slate-200">{displayDate}</span>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateInput}
          className="cursor-pointer rounded-md border border-slate-600/60 bg-slate-700/40 px-2 py-1 text-xs text-slate-100 transition-colors hover:border-cyan-500/40 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          aria-label="Select date"
        />
        <button
          onClick={handleToday}
          className="rounded-md border border-cyan-500/40 bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-500/30"
        >
          Today
        </button>
      </div>

      <button
        onClick={handleNextDay}
        className="rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-slate-100"
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
