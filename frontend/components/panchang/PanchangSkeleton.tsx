/**
 * PanchangSkeleton Component
 * Loading skeleton for Panchang data
 */

import { Card } from '@/components/ui/Card';
import React from 'react';

export const PanchangSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Date and Location Skeletons */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* PanchangCard Skeleton */}
          <Card className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* SunTimesCard Skeleton */}
          <Card className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AuspiciousTimesCard Skeleton */}
          <Card className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 bg-green-50 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* InauspiciousTimesCard Skeleton */}
          <Card className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-red-50 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
