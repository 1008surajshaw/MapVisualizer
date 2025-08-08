"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDashboardStore, FIXED_TIMELINE_START, FIXED_TIMELINE_END } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

type DragHandle = 'start' | 'end' | null;

export function SliderTrack() {
  const { 
    selectedTime, 
    selectedEndTime, 
    sliderMode, 
    setSelectedTime, 
    setSelectedEndTime 
  } = useDashboardStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [tempSelectedTime, setTempSelectedTime] = useState(selectedTime);
  const [tempSelectedEndTime, setTempSelectedEndTime] = useState(selectedEndTime);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Debounce the updates to prevent excessive re-renders
  const debouncedSelectedTime = useDebounce(tempSelectedTime, 100);
  const debouncedSelectedEndTime = useDebounce(tempSelectedEndTime, 100);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      setSelectedTime(debouncedSelectedTime);
    }
  }, [debouncedSelectedTime, isDragging, setSelectedTime]);

  useEffect(() => {
    if (!isDragging) {
      setSelectedEndTime(debouncedSelectedEndTime);
    }
  }, [debouncedSelectedEndTime, isDragging, setSelectedEndTime]);

  // Always use FIXED timeline bounds for calculations
  const dateToPosition = useCallback((date: Date) => {
    const startTime = FIXED_TIMELINE_START.getTime();
    const endTime = FIXED_TIMELINE_END.getTime();
    const currentTime = Math.max(startTime, Math.min(endTime, date.getTime()));
    return ((currentTime - startTime) / (endTime - startTime)) * 100;
  }, []);

  const positionToDate = useCallback((position: number) => {
    const clampedPosition = Math.max(0, Math.min(100, position));
    const startTime = FIXED_TIMELINE_START.getTime();
    const endTime = FIXED_TIMELINE_END.getTime();
    const targetTime = startTime + (clampedPosition / 100) * (endTime - startTime);
    return new Date(targetTime);
  }, []);

  const getPositionFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: DragHandle = 'start') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragHandle(handle);
    
    const position = getPositionFromEvent(e);
    const newDate = positionToDate(position);
    
    if (sliderMode === 'range') {
      if (handle === 'end') {
        // Ensure end time is after start time
        const newEndTime = Math.max(tempSelectedTime.getTime(), newDate.getTime());
        setTempSelectedEndTime(new Date(newEndTime));
      } else {
        // Ensure start time is before end time
        const newStartTime = Math.min(tempSelectedEndTime.getTime(), newDate.getTime());
        setTempSelectedTime(new Date(newStartTime));
      }
    } else {
      // In single mode, only update start time
      setTempSelectedTime(newDate);
    }
  }, [sliderMode, tempSelectedTime, tempSelectedEndTime, getPositionFromEvent, positionToDate]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle) return;
    
    const position = getPositionFromEvent(e);
    const newDate = positionToDate(position);
    
    if (sliderMode === 'range') {
      if (dragHandle === 'end') {
        const newEndTime = Math.max(tempSelectedTime.getTime(), newDate.getTime());
        setTempSelectedEndTime(new Date(newEndTime));
      } else {
        const newStartTime = Math.min(tempSelectedEndTime.getTime(), newDate.getTime());
        setTempSelectedTime(new Date(newStartTime));
      }
    } else {
      setTempSelectedTime(newDate);
    }
  }, [isDragging, dragHandle, sliderMode, tempSelectedTime, tempSelectedEndTime, getPositionFromEvent, positionToDate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // Add document-level mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    
    const position = getPositionFromEvent(e);
    const newDate = positionToDate(position);
    
    if (sliderMode === 'single') {
      setTempSelectedTime(newDate);
    } else {
      // In range mode, clicking on track moves the closest handle
      const startPos = dateToPosition(tempSelectedTime);
      const endPos = dateToPosition(tempSelectedEndTime);
      const distToStart = Math.abs(position - startPos);
      const distToEnd = Math.abs(position - endPos);
      
      if (distToStart < distToEnd) {
        const newStartTime = Math.min(tempSelectedEndTime.getTime(), newDate.getTime());
        setTempSelectedTime(new Date(newStartTime));
      } else {
        const newEndTime = Math.max(tempSelectedTime.getTime(), newDate.getTime());
        setTempSelectedEndTime(new Date(newEndTime));
      }
    }
  }, [isDragging, sliderMode, tempSelectedTime, tempSelectedEndTime, getPositionFromEvent, positionToDate, dateToPosition]);

  // Use temp values during dragging, actual values otherwise
  const currentSelectedTime = isDragging ? tempSelectedTime : selectedTime;
  const currentSelectedEndTime = isDragging ? tempSelectedEndTime : selectedEndTime;

  const startPosition = dateToPosition(currentSelectedTime);
  const endPosition = sliderMode === 'range' ? dateToPosition(currentSelectedEndTime) : dateToPosition(FIXED_TIMELINE_END);
  const rangeStart = Math.min(startPosition, endPosition);
  const rangeWidth = Math.abs(endPosition - startPosition);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{isMounted ? FIXED_TIMELINE_START.toLocaleDateString() : '12/17/2024'}</span>
        <span>Today</span>
        <span>{isMounted ? FIXED_TIMELINE_END.toLocaleDateString() : '1/16/2025'}</span>
      </div>

      <div 
        ref={sliderRef}
        className="relative h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 rounded-lg cursor-pointer overflow-hidden"
        onMouseDown={handleTrackClick}
      >
        {/* Range highlight */}
        {sliderMode === 'range' && (
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-green-400/60 to-green-500/60 rounded transition-all duration-75"
            style={{
              left: `${rangeStart}%`,
              width: `${rangeWidth}%`,
            }}
          />
        )}

        {/* Current time indicator (today) - only render on client */}
        {isMounted && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-75 z-10"
            style={{ left: `${dateToPosition(new Date())}%` }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        )}

        {/* Start handle */}
        <div
          className={cn(
            "absolute top-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab transition-all hover:scale-110 z-20",
            sliderMode === 'single' ? "bg-blue-600" : "bg-green-600",
            isDragging && dragHandle === 'start' && "cursor-grabbing scale-110"
          )}
          style={{ left: `${startPosition}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        />

        {/* End handle (only in range mode) */}
        {sliderMode === 'range' && (
          <div
            className={cn(
              "absolute top-1/2 w-6 h-6 bg-green-600 rounded-full border-3 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab transition-all hover:scale-110 z-20",
              isDragging && dragHandle === 'end' && "cursor-grabbing scale-110"
            )}
            style={{ left: `${endPosition}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'end')}
          />
        )}
      </div>

      {/* Timeline info */}
      <div className="text-xs text-muted-foreground text-center">
        Fixed timeline: {isMounted ? FIXED_TIMELINE_START.toLocaleDateString() : '12/17/2024'} to {isMounted ? FIXED_TIMELINE_END.toLocaleDateString() : '1/16/2025'}
      </div>
    </div>
  );
}
