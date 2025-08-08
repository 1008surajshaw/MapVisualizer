"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { DataSourceSidebar } from '@/components/DataSourceSidebar';
import { TimelineSlider } from '@/components/timeline/TimelineSlider';

import { WeatherPlayer } from '@/components/weather-player';
const MapboxPolygo = dynamic(() => import('../../components/Map'), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Dynamic Data Dashboard</h1>
          <p className="text-muted-foreground">
            Visualize dynamic data over maps and timelines with polygon creation and color-coded displays
          </p>
        </div>

        <div className="w-full">
          <TimelineSlider />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px]">
          <div className="lg:col-span-3">
            <MapboxPolygo/>
          </div>

          <div className="lg:col-span-1">
            <DataSourceSidebar />
          </div>
        </div>

        <div className="w-full">
          <WeatherPlayer maxDataPoints={48} />
        </div>

        {/* Status Bar */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground">
            Ready for polygon creation and data visualization
          </div>
        </div>
      </div>
    </div>
  );
}
