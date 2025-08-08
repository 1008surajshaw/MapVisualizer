'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { VirtualizedChart } from './VirtualizedChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Thermometer } from 'lucide-react';

interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export default function WeatherFetcher() {
  const { polygonData, selectedTime, selectedEndTime } = useDashboardStore();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const processedData = useMemo(() => {
    if (!weatherData?.hourly?.time || !weatherData?.hourly?.temperature_2m) return [];
    
    return weatherData.hourly.time.map((time, index) => ({
      time,
      temperature: weatherData.hourly.temperature_2m[index],
      formattedTime: new Date(time).toLocaleTimeString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit'
      })
    }));
  }, [weatherData]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!polygonData.centroid) return;

      setLoading(true);
      const lat = polygonData.centroid.lat;
      const lng = polygonData.centroid.lng;
      const start = selectedTime.toISOString().split('T')[0]; 
      const end = selectedEndTime.toISOString().split('T')[0];

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&hourly=temperature_2m`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [polygonData.centroid, selectedTime, selectedEndTime]);

  if (!polygonData.centroid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Select an area on the map to view weather data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Weather Analysis ({processedData.length} data points)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading weather data...</div>
        ) : processedData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Temperature Line Chart</h3>
              <VirtualizedChart 
                data={processedData} 
                type="line" 
                height={300}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Temperature Bar Chart</h3>
              <VirtualizedChart 
                data={processedData} 
                type="bar" 
                height={300}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No weather data available for the selected time range
          </div>
        )}
      </CardContent>
    </Card>
  );
}
