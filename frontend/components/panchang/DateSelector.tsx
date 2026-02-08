/**
 * DateSelector Component
 * Date picker with today button and navigation
 */

import dayjs from 'dayjs';
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

  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
  const displayDate = dayjs(selectedDate).format('dddd, MMMM D, YYYY');

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-5 border border-gray-200 dark:border-dark-border backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Previous Day Button */}
        <button
          onClick={handlePrevDay}
          className="p-3 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:scale-110 transition-all duration-200 shadow-sm bg-gray-100 dark:bg-dark-border/30"
          aria-label="Previous day"
        >
          <svg
            className="w-6 h-6 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Date Display and Input */}
        <div className="flex-1 text-center">
          <div className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            {displayDate}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateInput}
            className="text-sm text-gray-900 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-border/30 px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-dark-border hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-center cursor-pointer transition-colors shadow-sm"
          />
        </div>

        {/* Next Day Button */}
        <button
          onClick={handleNextDay}
          className="p-3 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:scale-110 transition-all duration-200 shadow-sm bg-gray-100 dark:bg-dark-border/30"
          aria-label="Next day"
        >
          <svg
            className="w-6 h-6 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Today Button */}
      {!isToday && (
        <div className="mt-4 text-center">
          <button
            onClick={handleToday}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            📅 Jump to Today
          </button>
        </div>
      )}
    </div>
  );
};
