'use client';

/**
 * ThemeContext — Astrome is a dark-only UI.
 *
 * The `.dark` class is applied once on mount and never removed.
 * The context is kept in place so existing `useTheme()` call sites
 * continue to compile without changes.
 */

import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  theme: 'dark';
  effectiveTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  effectiveTheme: 'dark',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Ensure the `dark` class is always present on <html>
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', effectiveTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
