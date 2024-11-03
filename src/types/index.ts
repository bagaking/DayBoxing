// Hour types
export type BaseHourType = "sleep" | "work" | "base" | "relax";

// Support custom types
export type HourType = BaseHourType | string;

// Part types
export type PartType = "full" | "mix" | "balance" | "chaos";

// Day segment
export interface DaySegment {
  type: PartType;
  mainType: HourType;
  secondaryType?: HourType;
  startHour: number;
  endHour: number;
}

// Hour data
export interface HourData {
  hour: number;
  type: HourType;
}

// Day data
export interface DayData {
  date: string;
  hours: HourData[];
  segments: DaySegment[];
}

// Theme configuration
export interface ThemeConfig {
  colors: {
    sleep: string;
    work: string;
    base: string;
    relax: string;
    background: string;
    text: string;
  };
  cellSize: number;
  gap: number;
  borderRadius: number;
}

// DayBoxingProps
export interface DayBoxingProps {
  // Support single or multiple days data
  data: DayData | DayData[];
  // Layout direction
  direction?: "horizontal" | "vertical";
  // Theme configuration
  theme?: Partial<ThemeConfig>;
  // Whether to show date label
  showDateLabel?: boolean;
  // Custom rendering function for hour cells
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  // Custom rendering function for date labels
  renderDateLabel?: (date: string) => React.ReactNode;
  // Data modification callback
  onHourChange?: (event: HourChangeEvent) => void;
  // Whether data can be modified
  editable?: boolean;
  // Shortcuts configuration
  shortcuts?: {
    [key: string]: HourType;
  };
  // Custom types configuration
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  // Optional type loop order
  typeOrder?: HourType[];
}

// HourTooltipData
export interface HourTooltipData {
  hour: number;
  type: HourType;
  date: string;
  segment?: DaySegment;
}

// Data modification event
export interface HourChangeEvent {
  hour: number;
  date: string;
  oldType: HourType;
  newType: HourType;
}
