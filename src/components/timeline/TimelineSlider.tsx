"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { SliderTrack } from './SliderTrack';
import { TimelineControls } from './TimelineControls';
import { SelectionDisplay } from './SelectionDisplay';

export function TimelineSlider() {
  const { sliderMode } = useDashboardStore();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline Control
          <Badge variant="outline" className="ml-auto">
            {sliderMode} mode
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SliderTrack />
            <SelectionDisplay />
          </div>
          <TimelineControls />
        </div>
      </CardContent>
    </Card>
  );
}
