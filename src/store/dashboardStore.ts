import { create } from 'zustand';

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface PolygonData {
  area: number | null;
  centroid: { lng: number; lat: number } | null;
}

export interface UserLocation {
  longitude: number;
  latitude: number;
  timestamp: number;
}

export interface DashboardState {
  selectedTime: Date;
  selectedEndTime: Date;
  sliderMode: 'single' | 'range';
  userLocation: UserLocation | null;
  polygonData: PolygonData;
  setSelectedTime: (time: Date) => void;
  setSelectedEndTime: (time: Date) => void;
  setSliderMode: (mode: 'single' | 'range') => void;
  setUserLocation: (location: UserLocation) => void;
  setPolygonData: (data: PolygonData) => void;
}

const getInitialDate = () => {
  if (typeof window !== 'undefined') {
    return new Date();
  }
  return new Date('2025-01-01T00:00:00.000Z');
};

const initialDate = getInitialDate();
export const FIXED_TIMELINE_START = new Date(initialDate.getTime() - 30 * 24 * 3600000);
export const FIXED_TIMELINE_END = new Date(initialDate.getTime() - 24 * 3600000);

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedTime: initialDate,
  selectedEndTime: FIXED_TIMELINE_END,
  sliderMode: 'single',
  userLocation: null, // Always null on reload
  polygonData: {
    area: null,
    centroid: null,
  }, // Always null on reload
  setSelectedTime: (time: Date) => {
    const clampedTime = new Date(Math.max(
      FIXED_TIMELINE_START.getTime(),
      Math.min(FIXED_TIMELINE_END.getTime(), time.getTime())
    ));
    set({ selectedTime: clampedTime });
  },
  setSelectedEndTime: (time: Date) => {
    const clampedTime = new Date(Math.max(
      FIXED_TIMELINE_START.getTime(),
      Math.min(FIXED_TIMELINE_END.getTime(), time.getTime())
    ));
    set({ selectedEndTime: clampedTime });
  },
  setSliderMode: (mode: 'single' | 'range') => set({ sliderMode: mode }),
  setUserLocation: (location: UserLocation) => set({ userLocation: location }),
  setPolygonData: (data: PolygonData) => set({ polygonData: data }),
}));
