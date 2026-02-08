'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'system' as const, label: 'System', icon: '💻' },
    { value: 'light' as const, label: 'Light', icon: '☀️' },
    { value: 'dark' as const, label: 'Dark', icon: '🌙' },
  ];

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mt-2 bg-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 animate-in slide-in-from-top-2">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTheme(t.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                theme === t.value
                  ? 'bg-red-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="font-medium text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center text-2xl ${
          theme === 'system' ? 'bg-red-500' :
          theme === 'light' ? 'bg-orange-400' :
          'bg-slate-700'
        }`}
        aria-label="Toggle theme"
      >
        {theme === 'system' ? '💻' : theme === 'light' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
