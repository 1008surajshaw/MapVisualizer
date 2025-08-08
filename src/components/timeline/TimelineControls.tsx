"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CalendarIcon, RotateCcw, Clock } from 'lucide-react';
import { useDashboardStore, FIXED_TIMELINE_START, FIXED_TIMELINE_END } from '@/store/dashboardStore';

export function TimelineControls() {
  const { 
    selectedTime, 
    selectedEndTime, 
    sliderMode, 
    setSelectedTime, 
    setSelectedEndTime, 
    setSliderMode 
  } = useDashboardStore();
  
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const toggleMode = () => {
    const newMode = sliderMode === 'single' ? 'range' : 'single';
    setSliderMode(newMode);
    
    if (newMode === 'single') {
      // In single mode, reset end time to max timeline
      setSelectedEndTime(FIXED_TIMELINE_END);
    } else if (selectedEndTime <= selectedTime) {
      // In range mode, ensure end time is after start time
      setSelectedEndTime(new Date(selectedTime.getTime() + 3600000)); // Add 1 hour
    }
  };

  const handleReset = () => {
    const now = new Date();
    setSelectedTime(now);
    setSelectedEndTime(FIXED_TIMELINE_END);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const newDate = new Date(selectedTime);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Clamp within fixed timeline bounds
    const clampedDate = new Date(Math.max(
      FIXED_TIMELINE_START.getTime(),
      Math.min(FIXED_TIMELINE_END.getTime(), newDate.getTime())
    ));
    
    setSelectedTime(clampedDate);
    setIsStartCalendarOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const newDate = new Date(selectedEndTime);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Clamp within fixed timeline bounds and ensure it's after start time
    const clampedDate = new Date(Math.max(
      selectedTime.getTime(),
      Math.min(FIXED_TIMELINE_END.getTime(), newDate.getTime())
    ));
    
    setSelectedEndTime(clampedDate);
    setIsEndCalendarOpen(false);
  };

  const handleStartTimeChange = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    
    const newDate = new Date(selectedTime);
    newDate.setHours(hours, minutes, 0, 0);
    
    // Clamp within fixed timeline bounds
    const clampedDate = new Date(Math.max(
      FIXED_TIMELINE_START.getTime(),
      Math.min(FIXED_TIMELINE_END.getTime(), newDate.getTime())
    ));
    
    setSelectedTime(clampedDate);
  };

  const handleEndTimeChange = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    
    const newDate = new Date(selectedEndTime);
    newDate.setHours(hours, minutes, 0, 0);
    
    // Clamp within fixed timeline bounds and ensure it's after start time
    const clampedDate = new Date(Math.max(
      selectedTime.getTime(),
      Math.min(FIXED_TIMELINE_END.getTime(), newDate.getTime())
    ));
    
    setSelectedEndTime(clampedDate);
  };

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Selection Mode</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="mode-toggle"
            checked={sliderMode === 'range'}
            onCheckedChange={toggleMode}
          />
          <Label htmlFor="mode-toggle" className="text-sm">
            {sliderMode === 'single' ? 'Single Point' : 'Range Selection'}
          </Label>
        </div>
        {sliderMode === 'single' && (
          <div className="text-xs text-muted-foreground">
            End point is fixed to timeline maximum
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Controls</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-2 w-full"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Now
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-semibold">Start Time</Label>
        
        {/* Start Date Picker */}
        <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate(selectedTime)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedTime}
              onSelect={handleStartDateSelect}
              disabled={(date) =>
                date < FIXED_TIMELINE_START || date > FIXED_TIMELINE_END
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Start Time Picker */}
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={formatTime(selectedTime)}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {sliderMode === 'range' && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold">End Time</Label>
          
          {/* End Date Picker */}
          <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(selectedEndTime)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedEndTime}
                onSelect={handleEndDateSelect}
                disabled={(date) =>
                  date < selectedTime || date > FIXED_TIMELINE_END
                }
                initialFocus
              />
            </PopoverContent>
            </Popover>

          {/* End Time Picker */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={formatTime(selectedEndTime)}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
        <div className="font-medium mb-1">Fixed Timeline:</div>
        <div>{formatDate(FIXED_TIMELINE_START)} to {formatDate(FIXED_TIMELINE_END)}</div>
        {sliderMode === 'range' && (
          <div className="mt-2">
            <div className="font-medium">Selected Duration:</div>
            <div>
              {Math.round((selectedEndTime.getTime() - selectedTime.getTime()) / 3600000)} hours
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
