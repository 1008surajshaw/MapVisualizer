"use client";

import React from 'react';
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface WeatherDataPoint {
  time: string;
  temperature: number;
  formattedTime: string;
}

interface VirtualizedChartProps {
  data: WeatherDataPoint[];
  type: 'line' | 'bar';
  height?: number;
}

export function VirtualizedChart({ 
  data, 
  type, 
  height = 300
}: VirtualizedChartProps) {
  const chartConfig = {
    temperature: {
      label: "Temperature (°C)",
      color: "hsl(220 70% 50%)",
    },
  };

  if (!data.length) return null;

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}px]`}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data}>
            <XAxis 
              dataKey="formattedTime" 
              fontSize={10}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={10} />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="var(--color-temperature)"
              strokeWidth={2}
              dot={{ r: 3 }}
              animationDuration={300}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <XAxis 
              dataKey="formattedTime" 
              fontSize={10}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={10} />
            <Bar 
              dataKey="temperature" 
              fill="var(--color-temperature)"
              radius={[2, 2, 0, 0]}
              animationDuration={300}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
}