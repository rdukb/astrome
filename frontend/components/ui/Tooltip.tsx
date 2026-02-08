/**
 * Tooltip Component
 *
 * Displays contextual information on hover or focus.
 */

'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      setCoords({ top, left });
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-gray-900 dark:after:border-t-gray-100',
    bottom: 'after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-gray-900 dark:after:border-b-gray-100',
    left: 'after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-gray-900 dark:after:border-l-gray-100',
    right: 'after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-gray-900 dark:after:border-r-gray-100',
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={cn(
            'fixed z-50 rounded-md bg-gray-900 dark:bg-gray-100 px-3 py-2 text-sm text-white dark:text-gray-900 shadow-lg',
            'after:content-[""] after:absolute after:border-4 after:border-transparent',
            positionClasses[position],
            className
          )}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';

export { Tooltip };
