export interface TimeRange {
    start: Date; 
    end: Date;  
  }
  
  export interface DashboardState {
    selectedTime: Date;
    timeRange: TimeRange;
    sliderMode: 'single' | 'range';
    setSelectedTime: (time: Date) => void;
    setTimeRange: (range: TimeRange) => void;
    setSliderMode: (mode: 'single' | 'range') => void;
  }
  
  export interface Polygon {
    id: string;
    points: [number, number][];
    dataSource?: string;
    color?: string;
    name?: string;
  }
  
  export interface DataSource {
    id: string;
    name: string;
    field: string;
    colorRules: ColorRule[];
  }
  
  export interface ColorRule {
    operator: '=' | '<' | '>' | '<=' | '>=';
    value: number;
    color: string;
  }
  