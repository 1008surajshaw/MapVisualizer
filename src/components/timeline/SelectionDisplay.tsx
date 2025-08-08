"use client";

import React, { useState, useEffect } from 'react';
import { useDashboardStore, FIXED_TIMELINE_END } from '@/store/dashboardStore';

export function SelectionDisplay() {
  const { selectedTime, selectedEndTime, sliderMode } = useDashboardStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h`;
  };

  // In single mode, show duration from selected time to timeline end
  const effectiveEndTime = sliderMode === 'single' ? FIXED_TIMELINE_END : selectedEndTime;

  // Show loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-background border rounded-lg p-4 shadow-sm">
        <div className="text-center space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Loading...</div>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg p-4 shadow-sm">
      {sliderMode === 'single' ? (
        <div className="text-center space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Selected Point</div>
          <div className="text-lg font-mono text-blue-600">
            {formatDateTime(selectedTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            Duration to timeline end: {formatDuration(selectedTime, FIXED_TIMELINE_END)}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Selected Range</div>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-2 bg-green-50 rounded border">
              <div className="text-xs text-muted-foreground">From</div>
              <div className="text-sm font-mono text-green-700">
                {formatDateTime(selectedTime)}
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded border">
              <div className="text-xs text-muted-foreground">To</div>
              <div className="text-sm font-mono text-green-700">
                {formatDateTime(selectedEndTime)}
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded border">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="text-sm font-semibold text-blue-700">
                {formatDuration(selectedTime, selectedEndTime)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
