"use client";

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export interface TimelineDataPoint {
  timestamp: Date;
  value: number;
  label: string;
}

export function useTimelineData() {
  const { selectedTime, selectedEndTime, sliderMode } = useDashboardStore();
  const [data, setData] = useState<TimelineDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateMockData = () => {
      setLoading(true);
      const mockData: TimelineDataPoint[] = [];
      
      const start = selectedTime;
      const end = selectedEndTime;
      
      for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
        mockData.push({
          timestamp: new Date(d),
          value: Math.random() * 30 + 5, 
          label: d.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit' 
          }),
        });
      }
      
      setData(mockData);
      setLoading(false);
    };

    generateMockData();
  }, [selectedTime, selectedEndTime]);

  const getCurrentData = () => {
    if (sliderMode === 'single') {
      return data.find(point => 
        Math.abs(point.timestamp.getTime() - selectedTime.getTime()) < 3600000 
      );
    } else {
      return data.filter(point => 
        point.timestamp >= selectedTime && point.timestamp <= selectedEndTime
      );
    }
  };

  return {
    data,
    loading,
    currentData: getCurrentData(),
  };
}
