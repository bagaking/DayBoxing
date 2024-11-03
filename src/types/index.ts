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
  distribution?: Record<string, number>;
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
  qhSegments?: QHAnalysis[];
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
  patterns: DayPattern[];
  dates: string[];
  direction?: "horizontal" | "vertical";
  theme?: Partial<ThemeConfig>;
  showDateLabel?: boolean;
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  renderDateLabel?: (date: string) => React.ReactNode;
  onHourChange?: (event: HourChangeEvent) => void;
  onPatternEdit?: (event: PatternEditEvent) => void;
  editable?: boolean;
  shortcuts?: {
    [key: string]: HourType;
  };
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
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

// 添加新的类型定义
export interface DayBoxingGridProps {
  data: DayData[];
  direction: "horizontal" | "vertical";
  theme: ThemeConfig;
  showDateLabel: boolean;
  renderDateLabel?: (date: string) => React.ReactNode;
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  onHourChange?: (event: HourChangeEvent) => void;
  editable: boolean;
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  onHover?: (data: HourTooltipData | null, event: React.MouseEvent) => void;
}

export interface DayRowProps extends Omit<DayBoxingGridProps, "data"> {
  day: DayData;
}

export interface TooltipProps {
  data: HourTooltipData;
  position: { x: number; y: number };
  theme: ThemeConfig;
}

// 在已有的类型定义中添加
export type QHSegment = "A" | "B" | "C" | "F";

export interface QHAnalysis {
  segment: QHSegment;
  startHour: number;
  endHour: number;
  type: PartType;
  mainType: HourType;
  secondaryType?: HourType;
}

// 在已有的类型定义中添加
export interface TimeBlock {
  type: HourType;
  duration: number; // 持续小时数
}

export interface DayPattern {
  startHour: number; // 可以是负数，表示从前一天开始
  blocks: TimeBlock[]; // 时间块定义
}

// 添加编辑操作的事件类型
export interface PatternEditEvent {
  date: string;
  type: "moveStart" | "addBlock" | "removeBlock" | "updateBlock";
  payload: {
    startHour?: number;
    blockIndex?: number;
    block?: TimeBlock;
  };
}
