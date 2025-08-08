"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Thermometer } from 'lucide-react'
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useDashboardStore } from '@/store/dashboardStore'

interface WeatherDataPoint {
  time: string
  temperature: number
  index: number
  formattedTime: string
}

interface WeatherPlayerProps {
  maxDataPoints?: number
}

export function WeatherPlayer({ maxDataPoints = 10 }: WeatherPlayerProps) {
  const { polygonData, selectedTime, selectedEndTime } = useDashboardStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const WINDOW_SIZE = 10

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!polygonData.centroid) return

      setLoading(true)
      const lat = polygonData.centroid.lat
      const lng = polygonData.centroid.lng
      const start = selectedTime.toISOString().split('T')[0]
      const end = selectedEndTime.toISOString().split('T')[0]

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&hourly=temperature_2m`

      try {
        const res = await fetch(url)
        const data = await res.json()
        setWeatherData(data)
      } catch (err) {
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [polygonData.centroid, selectedTime, selectedEndTime])

  // Process weather data with memoization
  const processedData = useMemo(() => {
    if (!weatherData?.hourly?.time || !weatherData?.hourly?.temperature_2m) return []

    return weatherData.hourly.time
    //@ts-ignore
      .map((time, index) => ({
        time,
        temperature: weatherData.hourly.temperature_2m[index],
        index,
        formattedTime: new Date(time).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit'
        })
      }))
      //@ts-ignore
      .filter(item => item.temperature !== null && item.temperature !== undefined)
  }, [weatherData])

  const displayData = useMemo(() => {
    if (processedData.length === 0) return []
    
    const startIndex = Math.max(0, currentIndex - WINDOW_SIZE + 1)
    const endIndex = currentIndex + 1
    return processedData.slice(startIndex, endIndex)
  }, [processedData, currentIndex, WINDOW_SIZE])

  // Animation logic
  useEffect(() => {
    if (!isPlaying || processedData.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= processedData.length) {
          setIsPlaying(false)
          return prev
        }
        return nextIndex
      })
    }, 1000) // 1 second per data point

    return () => clearInterval(interval)
  }, [isPlaying, processedData])

  const handlePlay = useCallback(() => {
    if (currentIndex >= processedData.length - 1) {
      setCurrentIndex(0)
    }
    setIsPlaying(true)
  }, [currentIndex, processedData])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleReplay = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [])

  const getTemperatureColor = (temp: number) => {
    if (temp < 10) return "#3b82f6" // blue-500
    if (temp >= 10 && temp <= 30) return "#10b981" // green-500  
    return "#ef4444" // red-500
  }

  const chartConfig = {
    temperature: {
      label: "Temperature (°C)",
      color: "#10b981",
    },
  }

  if (loading || !processedData.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather Animation Player
            <Badge variant="outline" className="ml-auto">
              {loading ? "Loading" : "No Data"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {!polygonData.centroid 
              ? "Please select an area on the map to fetch weather data"
              : loading
                ? "Loading weather data..."
                : "No weather data available"
            }
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Weather Animation Player
          <Badge variant="outline" className="ml-auto">
            {currentIndex + 1} / {processedData.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            size="lg"
            className="flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>
          <Button
            onClick={handleReplay}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Replay
          </Button>
        </div>

        {/* Current Data Point Info */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Current Time</div>
          <div className="text-lg font-mono font-semibold">
            {processedData[currentIndex]?.formattedTime || 'N/A'}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {processedData[currentIndex]?.temperature?.toFixed(1) || 'N/A'}°C
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Line Chart (Sliding Window)</h3>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <XAxis 
                    dataKey="formattedTime" 
                    fontSize={9}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    fontSize={10}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      return (
                        <circle 
                          key={`dot-${index}`}
                          cx={cx} 
                          cy={cy} 
                          r={3} 
                          fill={getTemperatureColor(payload?.temperature || 0)}
                        />
                      );
                    }}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bar Chart (Sliding Window)</h3>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                  <XAxis 
                    dataKey="formattedTime" 
                    fontSize={9}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    fontSize={10}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Bar 
                    dataKey="temperature" 
                    radius={[2, 2, 0, 0]}
                    animationDuration={300}
                  >
                    
                    {displayData.map((entry: WeatherDataPoint, index: number) => (
                      <Cell key={`cell-${index}`} fill={getTemperatureColor(entry.temperature)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Data Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(((currentIndex + 1) / processedData.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / processedData.length) * 100}%` }}
            />
          </div>
        </div>


      </CardContent>
    </Card>
  )
}
